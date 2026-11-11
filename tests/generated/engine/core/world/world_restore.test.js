// tests/generated/engine/core/world/world_restore.test.js

/**
 * @typedef {import("../../../../../src/engine/core/world/world.types.js").World} World
 * @typedef {import("../../../../../src/engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("../../../../../src/engine/core/ids.types.js").RoomID} RoomID
 * @typedef {import("../../../../../src/engine/extraction/ore.js").Ore} Ore
 * @typedef {import("../../../../../src/engine/inventory/inventory.types.js").__InternalItemID} __InternalItemID
 */
import { timelinedispatcher_register } from "../../../../../src/engine/core/timeline/dispatcher.js";
import { timelinescheduler_peek, timelinescheduler_schedule } from "../../../../../src/engine/core/timeline/scheduler.js";
import { world_connect_machines, world_mine, world_set_machine_recipe } from "../../../../../src/engine/core/world/world.js";
import { world_restore } from "../../../../../src/engine/core/world/world_restore.js";
import { inventory_add_stack } from "../../../../../src/engine/inventory/inventory.js";
import { materialitem_create } from "../../../../../src/engine/item/material/material_item.js";
import { array_get } from "../../../../../src/utils/array.js";
import { randomgenerator_next_int } from "../../../../../src/utils/random_generator.js";
import { repository_get } from "../../../../../src/utils/repository.js";
import { result_assert_ok, result_unwrap } from "../../../../../src/utils/result.js";
import { assert, assert_equal, assert_throws } from "../../../../shared/assert.js";
import { amounts_to_string, create_test_factory, create_test_store, create_test_world } from "../../../../shared/fixtures.js";
import { test } from "../../../../shared/test.js";

/**
 * @param {World} world
 * @returns {World}
 */
function __to_json(world) {
    return JSON.parse(JSON.stringify(world));
}

/** @returns {World} */
function __create_corruptible_world() {
    const { world, entity, copper_extractor, furnaces: [copper_furnace, other_furnace] } = create_test_factory();
    inventory_add_stack(world.inventory_repo, entity.inventory_id, materialitem_create({ kind: "ORE", material: "STONE", quality: "NORMAL" }), 2);
    result_assert_ok(world_set_machine_recipe(world, copper_furnace, "COPPER_SMELTING"));
    result_unwrap(world_connect_machines(world, copper_extractor, copper_furnace, "BELT"));
    result_unwrap(world_connect_machines(world, copper_furnace, other_furnace, "BELT"));
    return __to_json(world);
}

test("une partie neuve se recharge sans perte et reprend la même suite aléatoire", () => {
    const { world } = create_test_store();
    const loaded = world_restore(__to_json(world));
    assert_equal(JSON.stringify(loaded), JSON.stringify(world));
    for (let index = 0; index < 10; index++) {
        assert_equal(randomgenerator_next_int(loaded.random_generator, 1000), randomgenerator_next_int(world.random_generator, 1000));
    }
});

test("le chargement reconstruit les index, les appartenances et le tas depuis les données", () => {
    timelinedispatcher_register("craft_complete", () => {});
    const { world, entity, source, destination } = create_test_world();
    const event = timelinescheduler_schedule(world.timeline_scheduler, "craft_complete", 20, {});
    const saved = __to_json(world);
    saved.entity_repo.indices[entity.id] = 999;
    saved.inventory_repo.indices[entity.inventory_id] = 999;
    saved.timeline_scheduler.repo.indices[event.id] = 999;
    saved.timeline_scheduler.heap = [];
    array_get(saved.galaxy.room_repo.elements, 0).entities = [];
    array_get(saved.galaxy.room_repo.elements, 1).entities = [entity.id];
    const loaded = world_restore(saved);
    assert_equal(repository_get(loaded.entity_repo, entity.id)?.name, entity.name);
    assert(repository_get(loaded.inventory_repo, entity.inventory_id) !== undefined);
    assert_equal(repository_get(loaded.galaxy.room_repo, source.id)?.entities.join(","), String(entity.id));
    assert_equal(repository_get(loaded.galaxy.room_repo, destination.id)?.entities.length, 0);
    assert_equal(timelinescheduler_peek(loaded.timeline_scheduler)?.id, event.id);
});

test("les machines des salles, les débits et les productions sont recalculés au chargement", () => {
    const saved = __create_corruptible_world();
    const room = array_get(saved.galaxy.room_repo.elements, 0);
    const machines = room.machines.join();
    room.machines = [];
    array_get(saved.flow_connection_repo.elements, 0).throughput = [{ resource: "IRON_ORE", amount: 999 }];
    array_get(saved.machine_repo.elements, 4).production = [{ resource: "IRON_ORE", amount: 999 }];
    const loaded = world_restore(saved);
    assert_equal(array_get(loaded.galaxy.room_repo.elements, 0).machines.join(), machines);
    assert_equal(amounts_to_string(array_get(loaded.flow_connection_repo.elements, 0).throughput), "COPPER_ORE=600");
    assert_equal(amounts_to_string(array_get(loaded.machine_repo.elements, 4).production), "COPPER_INGOT=300");
});

test("un gisement à quantité nulle reste chargeable et extractible", () => {
    const { world, entity, ore } = create_test_world();
    array_get(ore.composition, 0).amount = 0;
    const loaded = world_restore(__to_json(world));
    result_assert_ok(world_mine(loaded, entity.id, ore.internal_id));
    assert_equal(array_get(loaded.galaxy.room_repo.elements, 0).content.length, 0);
    assert_equal(array_get(loaded.inventory_repo.elements, 0).item_stack.length, 0);
});

test("les données corrompues sont refusées pour la bonne raison", () => {
    world_restore(__create_corruptible_world());
    /** @param {World} world @param {number} index */
    const node = (world, index) => array_get(array_get(world.galaxy.room_repo.elements, 0).content, index);
    /** @param {World} world @param {number} index */
    const machine = (world, index) => array_get(world.machine_repo.elements, index);
    /** @param {World} world @param {number} index */
    const connection = (world, index) => array_get(world.flow_connection_repo.elements, index);
    /** @type {[(world: World) => void, string][]} */
    const corruptions = [
        [world => { world.clock.sim_time = /** @type {never} */ (null); }, "Invalid clock"],
        [world => { world.random_generator.state = 0.5; }, "Invalid random generator"],
        [world => { world.entity_repo.elements.push(array_get(world.entity_repo.elements, 0)); }, "Invalid repository element ID"],
        [world => { world.entity_repo.current_id = /** @type {EntityID} */ (0); }, "Invalid repository element ID"],
        [world => { array_get(world.entity_repo.elements, 0).room_id = /** @type {RoomID} */ (999); }, "Invalid entity"],
        [world => { array_get(world.inventory_repo.elements, 0).__current_internal_item_id = /** @type {__InternalItemID} */ (-1); }, "Invalid inventory"],
        [world => { array_get(array_get(world.inventory_repo.elements, 0).item_stack, 0).amount = 0; }, "Invalid inventory item"],
        [world => { array_get(/** @type {Ore} */ (node(world, 0)).composition, 0).amount = -1; }, "Invalid ore composition"],
        [world => { node(world, 3).kind = /** @type {never} */ ("UNKNOWN"); }, "Invalid ore"],
        [world => { Object.assign(node(world, 3), { resource: "IRON_ORE" }); }, "Invalid liquid node"],
        [world => { Object.assign(node(world, 3), { amount: -1 }); }, "Invalid liquid node"],
        [world => { machine(world, 0).kind = /** @type {never} */ ("UNKNOWN"); }, "Invalid machine"],
        [world => { machine(world, 0).room_id = /** @type {RoomID} */ (999); }, "Invalid machine"],
        [world => { machine(world, 0).node_id = /** @type {never} */ (999); }, "Invalid machine node"],
        [world => { machine(world, 1).node_id = machine(world, 0).node_id; }, "Invalid machine node"],
        [world => { machine(world, 0).recipe_id = "COPPER_EXTRACTION"; }, "Invalid machine recipe"],
        [world => { machine(world, 3).recipe_id = /** @type {never} */ ("UNKNOWN"); }, "Invalid machine recipe"],
        [world => { connection(world, 0).kind = /** @type {never} */ ("UNKNOWN"); }, "Invalid flow connection"],
        [world => { connection(world, 0).manual_throughput_limit = 0.5; }, "Invalid flow connection"],
        [world => { connection(world, 0).to = /** @type {never} */ (999); }, "Invalid flow connection"],
        [world => { connection(world, 0).to = connection(world, 0).from; }, "Invalid flow connection"],
        [world => { Object.assign(connection(world, 1), { from: connection(world, 0).from, to: connection(world, 0).to }); }, "Duplicate flow connection"],
        [world => { Object.assign(connection(world, 0), { from: connection(world, 1).to, to: connection(world, 1).from }); }, "Flow graph contains a cycle"],
        [world => { timelinescheduler_schedule(world.timeline_scheduler, "craft_complete", 20, {}); }, "Invalid timeline event"],
    ];
    for (const [corrupt, expected_message] of corruptions) {
        const world = __create_corruptible_world();
        corrupt(world);
        assert_throws(() => world_restore(world), Error, expected_message);
    }
});
