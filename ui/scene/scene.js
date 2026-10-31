/** @typedef {import("../component/core/utils.js").DestroyFunction} DestroyFunction */
import { utils_assert_unreachable } from "../../utils/utils.js";
import { uisignal_on } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store.js";
import { mainscene_mount } from "./main_scene.js";
import { menuscene_mount } from "./menu_scene.js";
import { SCENES } from "./scene.types.js";

/**
 * @param {HTMLElement} app
 * @returns {DestroyFunction}
 */
export function scene_mount(app) {
    /** @type {DestroyFunction|undefined} */
    let destroy_current_scene;
    const unmount = () => {
        const destroy = destroy_current_scene;
        destroy_current_scene = undefined;
        destroy?.();
        app.replaceChildren();
    };
    const render = () => {
        unmount();
        destroy_current_scene = __scene_mount_current(app);
    };
    const off_scene_switched = uisignal_on(UI_SIGNAL.SCENE_SWITCHED, render);
    const off_game_replacing = uisignal_on(UI_SIGNAL.GAME_REPLACING, unmount);
    const destroy = () => {
        off_scene_switched();
        off_game_replacing();
        unmount();
    };
    try {
        render();
    } catch (error) {
        destroy();
        throw error;
    }
    return destroy;
}

/**
 * @param {HTMLElement} app
 * @returns {DestroyFunction}
 */
function __scene_mount_current(app) {
    const scene = store_get().ui_state.scene;
    switch (scene) {
        case SCENES.MAIN:
            return mainscene_mount(app).destroy;
        case SCENES.MENU:
            return menuscene_mount(app).destroy;
        default:
            return utils_assert_unreachable(scene);
    }
}
