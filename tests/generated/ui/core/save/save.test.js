// tests/generated/ui/core/save/save.test.js

/**
 * @typedef {import("../../../../../src/ui/core/save/save.types.js").GameSave} GameSave
 * @typedef {import("../../../../../src/engine/core/world/world.types.js").World} World
 * @typedef {import("../../../../../src/engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("../../../../../src/engine/core/ids.types.js").RoomID} RoomID
 * @typedef {import("../../../../../src/engine/inventory/inventory.types.js").__InternalItemID} __InternalItemID
 */
import { timelinedispatcher_register } from "../../../../../src/engine/core/timeline/dispatcher.js";
import { timelinescheduler_peek, timelinescheduler_schedule } from "../../../../../src/engine/core/timeline/scheduler.js";
import { world_create, world_mine } from "../../../../../src/engine/core/world/world.js";
import { world_init } from "../../../../../src/engine/core/world/world_init.js";
import { world_restore } from "../../../../../src/engine/core/world/world_restore.js";
import { inventory_add_stack } from "../../../../../src/engine/inventory/inventory.js";
import { materialitem_create } from "../../../../../src/engine/item/material/material_item.js";
import { gamesave_create, gamesave_parse } from "../../../../../src/ui/core/save/save.js";
import { uistate_create } from "../../../../../src/ui/core/ui_state/ui_state.js";
import { array_get } from "../../../../../src/utils/array.js";
import { randomgenerator_next_int } from "../../../../../src/utils/random_generator.js";
import { repository_get } from "../../../../../src/utils/repository.js";
import { result_assert_ok } from "../../../../../src/utils/result.js";
import { undefined_unwrap } from "../../../../../src/utils/undefined.js";
import { assert, assert_equal, assert_throws } from "../../../../shared/assert.js";
import { create_test_world } from "../../../../shared/fixtures.js";
import { test } from "../../../../shared/test.js";

/**
 * @param {World} world
 * @returns {GameSave}
 */
function __save_to_json(world) {
    return JSON.parse(JSON.stringify(gamesave_create({ world, ui_state: uistate_create(), should_save: true })));
}

/** @returns {GameSave} */
function __create_corruptible_save() {
    const { world, entity } = create_test_world();
    inventory_add_stack(world.inventory_repo, entity.inventory_id, materialitem_create({ kind: "ORE", material: "STONE", quality: "NORMAL" }), 2);
    return __save_to_json(world);
}

test("la sauvegarde conserve les préférences et exclut les données transitoires", () => {
    const { world, entity } = create_test_world();
    const ui_state = uistate_create({ scene: "MENU", selected_entity_id: entity.id });
    ui_state.logs.push("transient");
    const save = JSON.parse(JSON.stringify(gamesave_create({ world, ui_state, should_save: true })));
    assert_equal(Object.keys(save.ui_state).sort().join(","), "scene,selected_entity_id");
    const restored_ui = uistate_create(undefined_unwrap(gamesave_parse(save)).ui_state);
    assert_equal(restored_ui.scene, "MENU");
    assert_equal(restored_ui.selected_entity_id, entity.id);
    assert_equal(restored_ui.logs.length, 0);
});

test("les anciens timers et journaux ne sont pas restaurés", () => {
    const { world, entity } = create_test_world();
    const save = __save_to_json(world);
    Object.assign(save.ui_state, { selected_entity_id: entity.id, tick_interval_id: 42, logs: ["old"] });
    const ui_state = uistate_create(undefined_unwrap(gamesave_parse(save)).ui_state);
    assert_equal(ui_state.logs.length, 0);
    assert(!Object.hasOwn(ui_state, "tick_interval_id"));
});

test("une partie neuve se recharge sans perte", () => {
    const world = world_create({ now: 0, seed: 1 });
    world_init(world);
    const loaded = undefined_unwrap(gamesave_parse(__save_to_json(world)));
    assert_equal(JSON.stringify(loaded.world), JSON.stringify(world));
});

test("le générateur aléatoire reprend la même suite après chargement", () => {
    const world = world_create({ now: 0, seed: 1 });
    world_init(world);
    const loaded = undefined_unwrap(gamesave_parse(__save_to_json(world)));
    for (let index = 0; index < 10; index++) {
        assert_equal(randomgenerator_next_int(loaded.world.random_generator, 1000), randomgenerator_next_int(world.random_generator, 1000));
    }
});

test("le chargement reconstruit les index, les appartenances et le tas depuis les données", () => {
    timelinedispatcher_register("craft_complete", () => {});
    const { world, entity, source, destination } = create_test_world();
    const event = timelinescheduler_schedule(world.timeline_scheduler, "craft_complete", 20, {});
    const save = __save_to_json(world);
    save.world.entity_repo.indices[entity.id] = 999;
    save.world.inventory_repo.indices[entity.inventory_id] = 999;
    save.world.timeline_scheduler.repo.indices[event.id] = 999;
    save.world.timeline_scheduler.heap = [];
    array_get(save.world.galaxy.room_repo.elements, 0).entities = [];
    array_get(save.world.galaxy.room_repo.elements, 1).entities = [entity.id];
    const loaded = undefined_unwrap(gamesave_parse(save));
    assert_equal(repository_get(loaded.world.entity_repo, entity.id)?.name, entity.name);
    assert(repository_get(loaded.world.inventory_repo, entity.inventory_id) !== undefined);
    assert_equal(repository_get(loaded.world.galaxy.room_repo, source.id)?.entities.join(","), String(entity.id));
    assert_equal(repository_get(loaded.world.galaxy.room_repo, destination.id)?.entities.length, 0);
    assert_equal(timelinescheduler_peek(loaded.world.timeline_scheduler)?.id, event.id);
});

test("un événement sans handler enregistré rend la sauvegarde invalide", () => {
    const { world } = create_test_world();
    timelinescheduler_schedule(world.timeline_scheduler, "craft_complete", 20, {});
    const save = __save_to_json(world);
    assert_throws(() => world_restore(save.world), Error, "Invalid timeline event");
});

test("les sauvegardes incomplètes et les versions inconnues sont refusées", () => {
    const { world } = create_test_world();
    const valid_save = __save_to_json(world);
    for (const value of [undefined, null, [], {}, { version: valid_save.version }, { ...valid_save, version: valid_save.version + 1 },
        { ...valid_save, ui_state: { scene: { toString: null } } }]) {
        assert_equal(gamesave_parse(value), undefined);
    }
    assert(gamesave_parse(valid_save) !== undefined);
});

test("les anciens gisements à quantité nulle restent chargeables et extractibles", () => {
    const { world, entity, ore } = create_test_world();
    array_get(ore.composition, 0).amount = 0;
    const loaded = undefined_unwrap(gamesave_parse(__save_to_json(world)));
    result_assert_ok(world_mine(loaded.world, entity.id, ore.internal_id));
    assert_equal(array_get(loaded.world.galaxy.room_repo.elements, 0).content.length, 0);
    assert_equal(array_get(loaded.world.inventory_repo.elements, 0).item_stack.length, 0);
});

test("les données corrompues sont refusées pour la bonne raison", () => {
    /** @type {[(save: GameSave) => void, string][]} */
    const corruptions = [
        [save => { save.world.clock.sim_time = /** @type {never} */ (null); }, "Invalid clock"],
        [save => { save.world.random_generator.state = 0.5; }, "Invalid random generator"],
        [save => { save.world.entity_repo.elements.push(array_get(save.world.entity_repo.elements, 0)); }, "Invalid repository element ID"],
        [save => { save.world.entity_repo.current_id = /** @type {EntityID} */ (0); }, "Invalid repository element ID"],
        [save => { array_get(save.world.entity_repo.elements, 0).room_id = /** @type {RoomID} */ (999); }, "Invalid entity"],
        [save => { array_get(save.world.inventory_repo.elements, 0).__current_internal_item_id = /** @type {__InternalItemID} */ (-1); }, "Invalid inventory"],
        [save => { array_get(array_get(save.world.inventory_repo.elements, 0).item_stack, 0).amount = 0; }, "Invalid inventory item"],
        [save => { array_get(save.world.galaxy.room_repo.elements, 0).machines = /** @type {never} */ (undefined); }, "Invalid room"],
        [save => { array_get(save.world.galaxy.room_repo.elements, 0).machines.push(/** @type {never} */ ({ kind: "UNKNOWN", id: 0 })); }, "Invalid room"],
        [save => { array_get(array_get(array_get(save.world.galaxy.room_repo.elements, 0).content, 0).composition, 0).amount = -1; }, "Invalid ore composition"],
    ];
    for (const [corrupt, expected_message] of corruptions) {
        world_restore(__create_corruptible_save().world);
        const save = __create_corruptible_save();
        corrupt(save);
        assert_throws(() => world_restore(save.world), Error, expected_message);
    }
});
