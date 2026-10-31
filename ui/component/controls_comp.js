// ui/component/controls_comp.js

/** @typedef {import("./core/utils.js").DestroyFunction} DestroyFunction */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_WEEK, SECONDS_PER_YEAR } from "../../utils/const.js";
import { enum_create } from "../../utils/enum.js";
import { utils_assert_unreachable, utils_string_to_rkind } from "../../utils/utils.js";
import { game_download_save, game_is_running, game_reset, game_skip_time, game_toggle_tick, game_upload_save } from "../core/game.js";
import { uisignal_on } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store/store.js";
import { scene_switch } from "../scene/scene.ops.js";
import { SCENES } from "../scene/scene.types.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "./core/comp.js";

const __ACTIONS = enum_create(/** @type {const} */ ([
    "SKIP_TIME",
    "TOGGLE_TICK",
    "SWITCH_SCENE",
    "DOWNLOAD_SAVE",
    "UPLOAD_SAVE",
    "CLEAR_SAVE",
]));
/** @typedef {EnumKey<typeof __ACTIONS>} Action */

/** @returns {string} */
export function controlscomp_render() {
    return `
<div class="controls-time">
    <button data-action="${__ACTIONS.SKIP_TIME}" data-amount="1000">1 seconde</button>
    <button data-action="${__ACTIONS.SKIP_TIME}" data-amount="${SECONDS_PER_MINUTE * 1000}">1 minute</button>
    <button data-action="${__ACTIONS.SKIP_TIME}" data-amount="${SECONDS_PER_HOUR * 1000}">1 heure</button>
    <button data-action="${__ACTIONS.SKIP_TIME}" data-amount="${SECONDS_PER_DAY * 1000}">1 jour</button>
    <button data-action="${__ACTIONS.SKIP_TIME}" data-amount="${SECONDS_PER_WEEK * 1000}">1 semaine</button>
    <button data-action="${__ACTIONS.SKIP_TIME}" data-amount="${SECONDS_PER_YEAR * 1000}">1 an</button>
</div>
<button data-action="${__ACTIONS.TOGGLE_TICK}">Start</button>
<button data-action="${__ACTIONS.SWITCH_SCENE}" data-scene="${SCENES.MENU}">Switch to menu</button>
<div class="controls-save">
    <button data-action="${__ACTIONS.DOWNLOAD_SAVE}">download save</button>
    <button data-action="${__ACTIONS.UPLOAD_SAVE}">upload save</button>
    <button data-action="${__ACTIONS.CLEAR_SAVE}">clear save</button>
</div>
    `;
}

/** @param {HTMLElement} element */
function __controlscomp_update_toggle_button(element) {
    const button = element.querySelector(`button[data-action="${__ACTIONS.TOGGLE_TICK}"]`);
    if (!button) throw new Error("Missing tick button");
    button.textContent = game_is_running() ? "Stop" : "Start";
}

/**
 * @param {HTMLElement} container
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function controlscomp_mount(container) {
    return comp_create_comp(container, "controls-comp", (element, add_cleanup) => {
        element.innerHTML = controlscomp_render();
        add_cleanup(comp_delegate_click_with_enum(element, __ACTIONS, (action, event, button) => {
            __controlscomp_handle_action(action, button);
        }));
        add_cleanup(uisignal_on(UI_SIGNAL.TOGGLE_TICK, () => __controlscomp_update_toggle_button(element)));
        __controlscomp_update_toggle_button(element);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} button
 */
function __controlscomp_handle_action(action, button) {
    switch (action) {
        case __ACTIONS.SKIP_TIME:
            game_skip_time(utils_string_to_rkind(button.dataset.amount));
            break;
        case __ACTIONS.TOGGLE_TICK:
            game_toggle_tick();
            break;
        case __ACTIONS.SWITCH_SCENE:
            if (button.dataset.scene !== undefined) scene_switch(store_get().ui_state, button.dataset.scene);
            break;
        case __ACTIONS.DOWNLOAD_SAVE:
            game_download_save();
            break;
        case __ACTIONS.UPLOAD_SAVE:
            void game_upload_save();
            break;
        case __ACTIONS.CLEAR_SAVE:
            game_reset();
            break;
        default:
            utils_assert_unreachable(action);
    }
}
