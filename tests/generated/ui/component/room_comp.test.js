// tests/generated/ui/component/room_comp.test.js

import { world_spawn_entity } from "../../../../src/engine/core/world/world.js";
import { roomcomp_mount } from "../../../../src/ui/component/room_comp.js";
import { store_set } from "../../../../src/ui/core/store/store.js";
import { uistate_create, uistate_select_entity } from "../../../../src/ui/core/ui_state/ui_state.js";
import { assert_equal } from "../../../shared/assert.js";
import { create_test_world } from "../../../shared/fixtures.js";
import { test } from "../../../shared/test.js";

test("changer la sélection affiche immédiatement la salle de la nouvelle entité", () => {
    const { world, entity, destination } = create_test_world();
    const second = world_spawn_entity(world, { name: "second", room_id: destination.id });
    const ui_state = uistate_create({ selected_entity_id: entity.id });
    store_set({ world, ui_state, should_save: true });
    const component = roomcomp_mount(document.createElement("div"));
    uistate_select_entity(ui_state, second.id);
    assert_equal(component.element.querySelector(".room-id")?.textContent, String(destination.id));
    component.destroy();
});
