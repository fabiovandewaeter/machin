// tests/ui/core/save.test.js

/** @typedef {import("../../../ui/core/save/save.types.js").GameSave} GameSave */
import { timelinescheduler_peek, timelinescheduler_schedule } from "../../../engine/core/timeline/scheduler.js";
import { world_mine } from "../../../engine/core/world/world.js";
import { gamesave_create, gamesave_parse } from "../../../ui/core/save/save.js";
import { uistate_create } from "../../../ui/core/ui_state/ui_state.js";
import { assert, assert_equal } from "../../../utils/assert.js";
import { repository_get } from "../../../utils/repository.js";
import { result_assert_ok } from "../../../utils/result.js";
import { undefined_unwrap } from "../../../utils/undefined.js";
import { create_test_world } from "../../fixtures.js";
import { test } from "../../test.js";

test("la sauvegarde conserve les préférences et exclut les données transitoires", () => {
    const { world, entity } = create_test_world();
    const ui_state = uistate_create({ scene: "MENU", selected_entity_id: entity.id });
    ui_state.logs.push("transient");
    const save = gamesave_create({ world, ui_state, should_save: true });
    const json = JSON.stringify(save);
    assert(!json.includes("logs"));
    assert(!json.includes("tick_interval_id"));
    const loaded = undefined_unwrap(gamesave_parse(JSON.parse(json)));
    const restored_ui = uistate_create(loaded.ui_state);
    assert_equal(restored_ui.scene, "MENU");
    assert_equal(restored_ui.selected_entity_id, entity.id);
    assert_equal(restored_ui.logs.length, 0);
});

test("les anciens timers et journaux ne sont pas restaurés", () => {
    const { world, entity } = create_test_world();
    const save = {
        version: 0,
        world,
        ui_state: { scene: "MAIN", selected_entity_id: entity.id, tick_interval_id: 42, logs: ["old"] },
    };
    const loaded = undefined_unwrap(gamesave_parse(save));
    const ui_state = uistate_create(loaded.ui_state);
    assert_equal(ui_state.logs.length, 0);
    assert(!Object.hasOwn(ui_state, "tick_interval_id"));
});

test("le chargement reconstruit les index, les appartenances et le tas depuis les données", () => {
    const { world, entity, source, destination } = create_test_world();
    const event = timelinescheduler_schedule(world.timeline_scheduler, "craft_complete", 20, {});
    const save = gamesave_create({ world, ui_state: uistate_create(), should_save: true });
    save.world.entity_repo.indices[entity.id] = 999;
    save.world.inventory_repo.indices[entity.inventory_id] = 999;
    save.world.timeline_scheduler.repo.indices[event.id] = 999;
    save.world.timeline_scheduler.heap = [];
    save.world.galaxy.room_repo.elements[0].entities = [];
    save.world.galaxy.room_repo.elements[1].entities = [entity.id];
    const loaded = undefined_unwrap(gamesave_parse(save));
    assert_equal(repository_get(loaded.world.entity_repo, entity.id)?.name, entity.name);
    assert(repository_get(loaded.world.inventory_repo, entity.inventory_id) !== undefined);
    assert_equal(repository_get(loaded.world.galaxy.room_repo, source.id)?.entities.join(","), String(entity.id));
    assert_equal(repository_get(loaded.world.galaxy.room_repo, destination.id)?.entities.length, 0);
    assert_equal(timelinescheduler_peek(loaded.world.timeline_scheduler)?.id, event.id);
});

test("les sauvegardes incomplètes et les versions inconnues sont refusées", () => {
    const { world } = create_test_world();
    for (const value of [undefined, null, [], {}, { version: 0 }, { version: 1, world },
        { version: 0, world, ui_state: { scene: { toString: null } } }]) {
        assert_equal(gamesave_parse(value), undefined);
    }
});

test("les anciens gisements à quantité nulle restent chargeables et extractibles", () => {
    const { world, entity, ore } = create_test_world();
    ore.composition[0].amount = 0;
    const save = gamesave_create({ world, ui_state: uistate_create(), should_save: true });
    const loaded = undefined_unwrap(gamesave_parse(save));
    result_assert_ok(world_mine(loaded.world, entity.id, ore.internal_id));
    assert_equal(loaded.world.galaxy.room_repo.elements[0].content.length, 0);
    assert_equal(loaded.world.inventory_repo.elements[0].item_stack.length, 0);
});

test("les références cassées, les identifiants dupliqués et les compteurs invalides sont refusés", () => {
    /** @type {((save: GameSave) => void)[]} */
    const corruptions = [
        save => { save.world.clock.sim_time = NaN; },
        save => { save.world.entity_repo.elements.push(save.world.entity_repo.elements[0]); },
        save => { save.world.entity_repo.current_id = /** @type {import("../../../engine/core/ids.types.js").EntityID} */ (0); },
        save => { save.world.entity_repo.elements[0].room_id = /** @type {import("../../../engine/core/ids.types.js").RoomID} */ (999); },
        save => { save.world.inventory_repo.elements[0].__current_intenal_item_id = /** @type {import("../../../engine/inventory/inventory.types.js").__InternalItemID} */ (-1); },
        save => { save.world.galaxy.room_repo.elements[0].content[0].composition[0].amount = -1; },
    ];
    for (const corrupt of corruptions) {
        const { world } = create_test_world();
        const save = gamesave_create({ world, ui_state: uistate_create(), should_save: true });
        corrupt(save);
        assert_equal(gamesave_parse(save), undefined);
    }
});
