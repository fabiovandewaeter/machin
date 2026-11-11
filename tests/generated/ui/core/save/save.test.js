// tests/generated/ui/core/save/save.test.js

import { gamesave_create, gamesave_parse } from "../../../../../src/ui/core/save/save.js";
import { uistate_create } from "../../../../../src/ui/core/ui_state/ui_state.js";
import { undefined_unwrap } from "../../../../../src/utils/undefined.js";
import { assert, assert_equal } from "../../../../shared/assert.js";
import { create_test_world } from "../../../../shared/fixtures.js";
import { test } from "../../../../shared/test.js";

test("la sauvegarde conserve les préférences et exclut les données transitoires", () => {
    const { world, entity } = create_test_world();
    const ui_state = uistate_create({ scene: "MENU", selected_entity_id: entity.id });
    ui_state.logs.push("transient");
    const save = JSON.parse(JSON.stringify(gamesave_create({ world, ui_state, should_save: true })));
    assert_equal(Object.keys(save.ui_state).sort().join(","), "scene,selected_entity_id");
    Object.assign(save.ui_state, { tick_interval_id: 42, logs: ["old"] });
    const restored_ui = uistate_create(undefined_unwrap(gamesave_parse(save)).ui_state);
    assert_equal(restored_ui.scene, "MENU");
    assert_equal(restored_ui.selected_entity_id, entity.id);
    assert_equal(restored_ui.logs.length, 0);
    assert(!Object.hasOwn(restored_ui, "tick_interval_id"));
});

test("les sauvegardes incomplètes, corrompues ou de version inconnue sont refusées", () => {
    const { world } = create_test_world();
    const valid_save = JSON.parse(JSON.stringify(gamesave_create({ world, ui_state: uistate_create(), should_save: true })));
    for (const value of [undefined, null, [], {}, { version: valid_save.version }, { ...valid_save, version: valid_save.version + 1 },
        { ...valid_save, ui_state: { scene: { toString: null } } }, { ...valid_save, world: { ...valid_save.world, clock: null } }]) {
        assert_equal(gamesave_parse(value), undefined);
    }
    assert(gamesave_parse(valid_save) !== undefined);
});
