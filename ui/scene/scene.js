// ui/scene/scene.js
// @ts-check

import { enum_create } from "../../utils/enum.js";
import { none, option_is_some, some } from "../../utils/option.js";
import { signalbus_on } from "../../utils/signal_bus.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { UISB, UI_SIGNAL } from "../core/signals.js";
import { store_get } from "../core/store.js";
import { mainscene_mount } from "./main_scene.js";
import { menuscene_mount } from "./menu_scene.js";

/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 */

// TODO: voir si on garde ça en global
/** @type {Opt<DestroyFunction>} */
let current_destroy = none;

export const SCENES = enum_create(/**@type {const}*/([
    "MAIN",
    "MENU",
]));
/** @typedef {EnumKey<typeof SCENES>} Scene */

export function scene_init() {
    signalbus_on(UISB, UI_SIGNAL.SCENE_SWITCHED, (payload) => {
        // TODO: VOIR SI CA SWITCH
        const app = document.getElementById("app");
        if (app) scene_render_current_scene(app);
    });
}

/**
 * @param {HTMLElement} app
 */
export function scene_render_current_scene(app) {
    if (option_is_some(current_destroy)) {
        current_destroy.value();
        current_destroy = none;
    }
    app.innerHTML = "";
    const store = store_get();
    switch (store.ui_state.scene) {
        case SCENES.MAIN:
            current_destroy = some(mainscene_mount(app).destroy);
            break;
        case SCENES.MENU:
            current_destroy = some(menuscene_mount(app).destroy);
            break;
        default: {
            utils_assert_unreachable(store.ui_state.scene);
        }
    }
}
