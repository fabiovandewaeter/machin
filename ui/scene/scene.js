// ui/scene/scene.js

/** @template T @typedef {import("../../utils/option.js").Opt<T>} Opt */
import { none, option_is_some, some } from "../../utils/option.js";
import { signalbus_on } from "../../utils/signal_bus.js";
import { utils_assert_unreachable } from "../../utils/utils.js";
import { UISB } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store.js";
import { mainscene_mount } from "./main_scene.js";
import { menuscene_mount } from "./menu_scene.js";
import { SCENES } from "./scene.types.js";

/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 */

// TODO: voir si on garde ça en global
/** @type {Opt<DestroyFunction>} */
let __CURRENT_SCENE_DESTROY_FUNCTION = none;

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
    if (option_is_some(__CURRENT_SCENE_DESTROY_FUNCTION)) {
        __CURRENT_SCENE_DESTROY_FUNCTION.value();
        __CURRENT_SCENE_DESTROY_FUNCTION = none;
    }
    app.innerHTML = "";
    const store = store_get();
    switch (store.ui_state.scene) {
        case SCENES.MAIN:
            __CURRENT_SCENE_DESTROY_FUNCTION = some(mainscene_mount(app).destroy);
            break;
        case SCENES.MENU:
            __CURRENT_SCENE_DESTROY_FUNCTION = some(menuscene_mount(app).destroy);
            break;
        default: {
            utils_assert_unreachable(store.ui_state.scene);
        }
    }
}
