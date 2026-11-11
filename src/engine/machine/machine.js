// engine/machine/machine.js

// 1) extracteurs (mine, ferme à cristaux, extracteurs gas/liquide etc.)
// 2) transformateurs
// 3) feuilles 

// TODO:
// machine full pression:
// 2 slots et on peut mettre des modules de pression de lvl 1 à 3 max

// le problème c'est que ça cute super cher les lvl 2 comparé à lvl 1 donc au début notre max c'est 3 fois lvl 1 même si
// la machine pourrait déjà nous faire des trucs ultimes

// on débloque petit à petit et une machine end game c'est machine lvl 3 + modules lvl 5 optimisés pour produire assez de chaleur et pression etc.

/**
 * @import {MachineID, RoomID} from "../core/ids.types.js"
 * @import {__InternalNodeID} from "../core/ids.types.js"
 * @import {ResourceNode} from "../extraction/node.types.js"
 * @import {Recipe, RecipeID} from "../item/recipe.js"
 * @import {RoomRepo} from "../map/room/room.types.js"
 * @import {Machine, MachineDefinition, MachineKind, MachineRepo} from "./machine.types.js"
 */
import { repository_get, repository_spawn_element } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { enginesignal_emit } from "../core/signal/signal.js";
import { node_has_resource } from "../extraction/node.js";
import { RECIPE } from "../item/recipe.js";

/** @type {Readonly<Record<MachineKind, MachineDefinition>>} */
export const MACHINE = Object.freeze({
    EXTRACTOR: { placed_on_node: true, recipes: ["STONE_EXTRACTION", "COPPER_EXTRACTION", "IRON_EXTRACTION"] },
    PUMP: { placed_on_node: true, recipes: ["WATER_PUMPING"] },
    FURNACE: { placed_on_node: false, recipes: ["COPPER_SMELTING", "IRON_SMELTING", "BRONZE_SMELTING"] },
});

/**
 * @param {MachineRepo} repo
 * @param {Object} options
 * @param {MachineKind} options.kind
 * @param {RoomID} options.room_id
 * @param {__InternalNodeID|undefined} options.node_id
 * @returns {Machine}
 */
export function machine_spawn(repo, { kind, room_id, node_id }) {
    return repository_spawn_element(repo, {
        kind,
        room_id,
        node_id,
        recipe_id: undefined,
        production: [],
    });
}

/**
 * @param {MachineRepo} repo
 * @param {MachineID} id
 * @param {RecipeID|undefined} recipe_id
 */
export function machine_set_recipe(repo, id, recipe_id) {
    const machine = undefined_unwrap(repository_get(repo, id));
    const previous_recipe_id = machine.recipe_id;
    machine.recipe_id = recipe_id;
    enginesignal_emit("machine.recipe_id.changed", {
        machine_id: id,
        previous_recipe_id,
        new_recipe_id: recipe_id,
    });
}

/**
 * @param {Machine} machine
 * @returns {Recipe|undefined}
 */
export function machine_recipe(machine) {
    return machine.recipe_id === undefined ? undefined : RECIPE[machine.recipe_id];
}

/**
 * @param {RoomRepo} room_repo
 * @param {Machine} machine
 * @returns {ResourceNode|undefined}
 */
export function machine_node(room_repo, machine) {
    if (machine.node_id === undefined) return undefined;
    return repository_get(room_repo, machine.room_id)?.content.find(node => node.internal_id === machine.node_id);
}

/**
 * @param {Machine} machine
 * @param {ResourceNode|undefined} node
 * @param {RecipeID} recipe_id
 * @returns {boolean}
 */
export function machine_can_use_recipe(machine, node, recipe_id) {
    return Object.hasOwn(RECIPE, recipe_id) && MACHINE[machine.kind].recipes.includes(recipe_id)
        && RECIPE[recipe_id].node_inputs.every(input => node_has_resource(node, input.resource));
}
