import { enginesignal_emit } from "../../../engine/core/signal/signal.js";
import { world_create, world_spawn_entity } from "../../../engine/core/world/world.js";
import { roomcomp_mount } from "../../../ui/component/room_comp.js";
import { uisignal_emit } from "../../../ui/core/signal/signal.js";
import { UI_SIGNAL } from "../../../ui/core/signal/signal.types.js";
import { store_set } from "../../../ui/core/store.js";
import { uistate_create, uistate_select_entity } from "../../../ui/core/ui_state/ui_state.js";
import { scene_mount } from "../../../ui/scene/scene.js";
import { assert, assert_equal } from "../../../utils/assert.js";
import { create_test_world } from "../../fixtures.js";
import { test } from "../../test.js";

test("changer la sélection affiche immédiatement la salle de la nouvelle entité", () => {
    const { world, entity, destination } = create_test_world();
    const second = world_spawn_entity(world, { name: "second", room_id: destination.id });
    const ui_state = uistate_create({ selected_entity_id: entity.id });
    store_set({ world, ui_state, should_save: true });
    const container = document.createElement("div");
    const component = roomcomp_mount(container);
    try {
        uistate_select_entity(ui_state, second.id);
        assert_equal(component.element.querySelector(".room-id")?.textContent, String(destination.id));
    } finally {
        component.destroy();
    }
});

test("remplacer une partie détruit les abonnements de ses panneaux avant de changer le store", () => {
    const { world, entity } = create_test_world();
    store_set({ world, ui_state: uistate_create({ selected_entity_id: entity.id }), should_save: true });
    const container = document.createElement("div");
    const destroy = scene_mount(container);
    try {
        uisignal_emit(UI_SIGNAL.OPEN_ENTITY_PANEL, { entity_id: entity.id });
        assert(container.querySelector(".entity-comp") !== null);
        uisignal_emit(UI_SIGNAL.GAME_REPLACING);
        assert_equal(container.children.length, 0);
        store_set({ world: world_create(), ui_state: uistate_create(), should_save: true });
        enginesignal_emit("inventory.item_stack.added", {
            inventory_id: entity.inventory_id,
            added: /** @type {import("../../../engine/inventory.types.js").__InternalItemID} */ (0),
        });
        uisignal_emit(UI_SIGNAL.SCENE_SWITCHED, { new_scene: "MAIN" });
        assert_equal(container.querySelectorAll(".scene-main").length, 1);
        assert_equal(container.querySelectorAll(".entity-comp").length, 0);
    } finally {
        destroy();
    }
});
