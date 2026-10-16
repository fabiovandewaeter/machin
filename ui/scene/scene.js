// ui/scene/scene.js

import { utils_assert_unreachable } from "../../utils/utils.js";
import { uisignal_on } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store.js";
import { mainscene_mount } from "./main_scene.js";
import { menuscene_mount } from "./menu_scene.js";
import { SCENES } from "./scene.types.js";

/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 */

// TODO: voir si on garde ça en global
/** @type {DestroyFunction|undefined} */
let __CURRENT_SCENE_DESTROY_FUNCTION = undefined;

export function scene_init() {
    uisignal_on(UI_SIGNAL.SCENE_SWITCHED, (payload) => {
        // TODO: VOIR SI CA SWITCH
        const app = document.getElementById("app");
        if (app) scene_render_current_scene(app);
    });
}

/**
 * @param {HTMLElement} app
 */
export function scene_render_current_scene(app) {
    if (__CURRENT_SCENE_DESTROY_FUNCTION !== undefined) {
        __CURRENT_SCENE_DESTROY_FUNCTION;
        __CURRENT_SCENE_DESTROY_FUNCTION = undefined;
    }
    app.innerHTML = "";
    const store = store_get();
    switch (store.ui_state.scene) {
        case SCENES.MAIN:
            __CURRENT_SCENE_DESTROY_FUNCTION = mainscene_mount(app).destroy;
            break;
        case SCENES.MENU:
            __CURRENT_SCENE_DESTROY_FUNCTION = menuscene_mount(app).destroy;
            break;
        default: {
            utils_assert_unreachable(store.ui_state.scene);
        }
    }
}
