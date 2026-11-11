// tests/shared/fixtures.js

/**
 * @typedef {import("../../src/engine/core/ids.types.js").__InternalNodeID} NodeID
 * @typedef {import("../../src/engine/core/ids.types.js").MachineID} MachineID
 * @typedef {import("../../src/engine/item/recipe.js").ResourceAmount} ResourceAmount
 */
import { world_create, world_move_entity, world_place_machine, world_set_machine_recipe, world_spawn_entity } from "../../src/engine/core/world/world.js";
import { world_init } from "../../src/engine/core/world/world_init.js";
import { liquidnode_create } from "../../src/engine/extraction/node.js";
import { ore_create } from "../../src/engine/extraction/ore.js";
import { materialitem_create, materialitem_create_stack } from "../../src/engine/item/material/material_item.js";
import { pickaxe_craft } from "../../src/engine/item/tool/pickaxe.js";
import { room_add_exit, room_spawn } from "../../src/engine/map/room/room.js";
import { store_set } from "../../src/ui/core/store/store.js";
import { uistate_create } from "../../src/ui/core/ui_state/ui_state.js";
import { array_get } from "../../src/utils/array.js";
import { result_assert_ok, result_unwrap } from "../../src/utils/result.js";
import { undefined_unwrap } from "../../src/utils/undefined.js";

export function create_test_world() {
    const world = world_create({ now: 0, seed: 1 });
    const ore = ore_create({
        internal_id: /** @type {NodeID} */ (0),
        composition: [materialitem_create_stack(materialitem_create({ kind: "ORE", material: "STONE", quality: "NORMAL" }), 2)],
    });
    const source = room_spawn(world.galaxy.room_repo, { kind: "CITY", name: "source", layer: 0, content: [ore] });
    const destination = room_spawn(world.galaxy.room_repo, { kind: "FOREST", name: "destination", layer: 0, content: [] });
    const isolated = room_spawn(world.galaxy.room_repo, { kind: "MOUNTAIN", name: "isolated", layer: 0, content: [] });
    room_add_exit(world.galaxy.room_repo, source.id, "destination", { target_id: destination.id });
    room_add_exit(world.galaxy.room_repo, destination.id, "source", { target_id: source.id });
    const tool = result_unwrap(pickaxe_craft({
        parts: {
            ROD: materialitem_create({ kind: "ROD", material: "STONE", quality: "NORMAL" }),
            HEAD: materialitem_create({ kind: "HEAD", material: "STONE", quality: "NORMAL" }),
        },
    }));
    const entity = world_spawn_entity(world, { name: "robot", room_id: source.id, tool });
    return { world, source, destination, isolated, ore, tool, entity };
}

export function create_test_factory() {
    const test_world = create_test_world();
    const { world, source, ore } = test_world;
    const [copper_node, iron_node, water_node] = /** @type {[NodeID, NodeID, NodeID]} */ ([1, 2, 3]);
    /** @type {[NodeID, import("../../src/engine/item/material/material.js").MaterialKind][]} */
    const ore_nodes = [[copper_node, "COPPER"], [iron_node, "IRON"]];
    for (const [internal_id, material] of ore_nodes) {
        source.content.push(ore_create({
            internal_id,
            composition: [materialitem_create_stack(materialitem_create({ kind: "ORE", material, quality: "NORMAL" }), 5)],
        }));
    }
    source.content.push(liquidnode_create({ internal_id: water_node, resource: "WATER", amount: 5 }));
    /**
     * @param {import("../../src/engine/machine/machine.types.js").MachineKind} kind
     * @param {NodeID} [node_id]
     * @param {import("../../src/engine/item/recipe.js").RecipeID} [recipe_id]
     * @returns {MachineID}
     */
    const place_machine = (kind, node_id, recipe_id) => {
        const machine = result_unwrap(world_place_machine(world, { kind, room_id: source.id, node_id }));
        if (recipe_id !== undefined) result_assert_ok(world_set_machine_recipe(world, machine.id, recipe_id));
        return machine.id;
    };
    return {
        ...test_world,
        stone_extractor: place_machine("EXTRACTOR", ore.internal_id, "STONE_EXTRACTION"),
        copper_extractor: place_machine("EXTRACTOR", copper_node, "COPPER_EXTRACTION"),
        iron_extractor: place_machine("EXTRACTOR", iron_node, "IRON_EXTRACTION"),
        water_pump: place_machine("PUMP", water_node, "WATER_PUMPING"),
        /** @type {[MachineID, MachineID, MachineID]} */
        furnaces: [place_machine("FURNACE"), place_machine("FURNACE"), place_machine("FURNACE")],
    };
}

/** @param {{in_factory_room?: boolean}} [options] */
export function create_test_store({ in_factory_room = false } = {}) {
    const world = world_create({ now: 0, seed: 1 });
    world_init(world);
    const entity = array_get(world.entity_repo.elements, 0);
    const factory_room = undefined_unwrap(world.galaxy.room_repo.elements.find(room => room.name === "usine"));
    if (in_factory_room) result_assert_ok(world_move_entity(world, entity.id, factory_room.id));
    const ui_state = uistate_create({ selected_entity_id: entity.id });
    store_set({ world, ui_state, should_save: true });
    return { world, ui_state, entity, factory_room };
}

/**
 * @param {ResourceAmount[]} amounts
 * @returns {string}
 */
export function amounts_to_string(amounts) {
    return amounts.map(entry => `${entry.resource}=${entry.amount}`).join(",");
}
