// engine/core/world/world_init.js

/**
 * @import {World} from "./world.types.js"
 * @import {MaterialKind} from "../../item/material/material.js"
 * @import {Quality} from "../../item/quality.js"
 * @import {__InternalNodeID, MachineID} from "../ids.types.js"
 * @import {RecipeID} from "../../item/recipe.js"
 * @import {MachineKind} from "../../machine/machine.types.js"
 * @import {Room} from "../../map/room/room.types.js"
 */
import { assert } from "../../../utils/assert.js";
import { result_unwrap } from "../../../utils/result.js";
import { inventory_add_stack } from "../../inventory/inventory.js";
import { liquidnode_create } from "../../extraction/node.js";
import { ore_create } from "../../extraction/ore.js";
import { materialitem_create, materialitem_create_stack } from "../../item/material/material_item.js";
import { pickaxe_craft } from "../../item/tool/pickaxe.js";
import { GALAXY_DEFAULT_ROOM_ID, galaxy_init } from "../../map/galaxy.js";
import { room_add_exit, room_spawn } from "../../map/room/room.js";
import { enginesignals_batch } from "../signal/signal.js";
import { world_connect_machines, world_place_machine, world_set_flow_connection_limit, world_set_machine_recipe, world_spawn_entity } from "./world.js";

/** @param {World} world */
export function world_init(world) {
    assert(world.galaxy.room_repo.elements.length === 0 && world.entity_repo.elements.length === 0
        && world.inventory_repo.elements.length === 0, "World is already initialized");
    enginesignals_batch(() => {
        galaxy_init(world.galaxy, world.random_generator);
        const robot = world_spawn_entity(world, {
            name: "robot 1",
            room_id: GALAXY_DEFAULT_ROOM_ID,
            tool: __worldinit_create_pickaxe("STONE", "POOR"),
        });
        inventory_add_stack(world.inventory_repo, robot.inventory_id, __worldinit_create_pickaxe("IRON", "PERFECT"), 1);
        world_spawn_entity(world, {
            name: "entity 2",
            room_id: GALAXY_DEFAULT_ROOM_ID,
            tool: __worldinit_create_pickaxe("STONE", "POOR"),
        });
        __worldinit_create_example_factory(world);
    });
}

/** @param {World} world */
function __worldinit_create_example_factory(world) {
    const [stone_node, copper_node, iron_node, water_node] = /** @type {[__InternalNodeID, __InternalNodeID, __InternalNodeID, __InternalNodeID]} */ ([0, 1, 2, 3]);
    /** @type {[__InternalNodeID, MaterialKind][]} */
    const ore_nodes = [[stone_node, "STONE"], [copper_node, "COPPER"], [iron_node, "IRON"]];
    const room = room_spawn(world.galaxy.room_repo, {
        kind: "RIVER",
        name: "usine",
        layer: 0,
        content: [
            ...ore_nodes.map(([internal_id, material]) => ore_create({
                internal_id,
                composition: [materialitem_create_stack(materialitem_create({ kind: "ORE", material, quality: "NORMAL" }), 20)],
            })),
            liquidnode_create({ internal_id: water_node, resource: "WATER", amount: 20 }),
        ],
    });
    room_add_exit(world.galaxy.room_repo, GALAXY_DEFAULT_ROOM_ID, "usine", { target_id: room.id });
    room_add_exit(world.galaxy.room_repo, room.id, "room default", { target_id: GALAXY_DEFAULT_ROOM_ID });

    const stone_extractor = __worldinit_place_machine(world, room, "EXTRACTOR", "STONE_EXTRACTION", stone_node);
    const copper_extractor = __worldinit_place_machine(world, room, "EXTRACTOR", "COPPER_EXTRACTION", copper_node);
    const iron_extractor = __worldinit_place_machine(world, room, "EXTRACTOR", "IRON_EXTRACTION", iron_node);
    const water_pump = __worldinit_place_machine(world, room, "PUMP", "WATER_PUMPING", water_node);
    const copper_furnace = __worldinit_place_machine(world, room, "FURNACE", "COPPER_SMELTING");
    const iron_furnace = __worldinit_place_machine(world, room, "FURNACE", "IRON_SMELTING");
    const bronze_furnace = __worldinit_place_machine(world, room, "FURNACE", "BRONZE_SMELTING");

    result_unwrap(world_connect_machines(world, copper_extractor, copper_furnace, "BELT"));
    result_unwrap(world_connect_machines(world, copper_furnace, bronze_furnace, "BELT"));
    result_unwrap(world_connect_machines(world, stone_extractor, bronze_furnace, "BELT"));
    result_unwrap(world_connect_machines(world, water_pump, iron_extractor, "PIPE"));
    const iron_truck = result_unwrap(world_connect_machines(world, iron_extractor, iron_furnace, "TRUCK"));
    result_unwrap(world_set_flow_connection_limit(world, iron_truck.id, 400));
}

/**
 * @param {World} world
 * @param {Room} room
 * @param {MachineKind} kind
 * @param {RecipeID} recipe_id
 * @param {__InternalNodeID} [node_id]
 * @returns {MachineID}
 */
function __worldinit_place_machine(world, room, kind, recipe_id, node_id) {
    const machine = result_unwrap(world_place_machine(world, { kind, room_id: room.id, node_id }));
    result_unwrap(world_set_machine_recipe(world, machine.id, recipe_id));
    return machine.id;
}

/**
 * @param {MaterialKind} material
 * @param {Quality} quality
 */
function __worldinit_create_pickaxe(material, quality) {
    return result_unwrap(pickaxe_craft({
        parts: {
            ROD: materialitem_create({ kind: "ROD", material, quality }),
            HEAD: materialitem_create({ kind: "HEAD", material, quality }),
        },
    }));
}
