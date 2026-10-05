// ui/scene/scene.js
// @ts-check

/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 */
import * as MainScene from "./main_scene.js";
import * as MenuScene from "./menu_scene.js";
import * as Store from "../core/store.js";
import * as Opt from "../../utils/option.js";
import * as UISB from "../core/signals.js";
import * as Utils from "../../utils/utils.js";
import * as SB from "../../utils/signal_bus.js";
import * as Enum from "../../utils/enum.js";

// TODO: voir si on garde ça en global
/** @type {Opt<DestroyFunction>} */
let current_destroy = Opt.none;

export const SCENES = Enum.create(/**@type {const}*/([
    "MAIN",
    "MENU",
]));
/** @typedef {EnumKey<typeof SCENES>} Scene */

export function init() {
    SB.on(UISB.BUS, UISB.UI_SIGNAL.SCENE_SWITCHED, (payload) => {
        // TODO: VOIR SI CA SWITCH
        const app = document.getElementById("app");
        if (app) render_current_scene(app);
    });
}

/**
 * @param {HTMLElement} app
 */
export function render_current_scene(app) {
    if (Opt.is_some(current_destroy)) {
        current_destroy.value();
        current_destroy = Opt.none;
    }
    app.innerHTML = "";
    const store = Store.get();
    switch (store.ui_state.scene) {
        case SCENES.MAIN:
            current_destroy = Opt.some(MainScene.mount(app).destroy);
            break;
        case SCENES.MENU:
            current_destroy = Opt.some(MenuScene.mount(app).destroy);
            break;
        default: {
            Utils.assert_unreachable(store.ui_state.scene);
        }
    }
}
