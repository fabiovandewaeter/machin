// ui/core/component/controls_comp.js

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_WEEK, SECONDS_PER_YEAR } from "../../utils/const.js";
import { utils_assert_unreachable, utils_string_to_rkind } from "../../utils/utils.js";
import { save_clear, save_download, save_upload } from "../../utils/save.js";
import { uistate_add_log, uistate_stop_tick } from "../core/ui_state/ui_state.js";
import { store_get, store_set_world } from "../core/store.js";
import { enum_create } from "../../utils/enum.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "./core/comp.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { SCENES } from "../scene/scene.types.js";
import { timeline_advance_by, timeline_advance_to } from "../../engine/core/timeline/timeline.js";
import { scene_switch } from "../scene/scene.ops.js";
import { uisignal_emit, uisignal_on } from "../core/signal/signal.js";

const __TICK_DELAY_MS = 1000;

const __ACTIONS = enum_create(/**@type {const}*/([
    "SKIP_SECONDS",
    "TOGGLE___TICK",
    "SWITCH_SCENE",
    "DOWNLOAD_SAVE",
    "UPLOAD_SAVE",
    "CLEAR_SAVE",
]));
/**@typedef {EnumKey<typeof __ACTIONS>} Action*/

/**
 * @returns {string}
 */
export function controlscomp_render() {
    return `
<div class="controls-time">
    <button data-action="${__ACTIONS.SKIP_SECONDS}" data-amount=${__TICK_DELAY_MS}>1 seconde</button>
    <button data-action="${__ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_MINUTE * __TICK_DELAY_MS}>1 minute</button>
    <button data-action="${__ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_HOUR * __TICK_DELAY_MS}>1 heure</button>
    <button data-action="${__ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_DAY * __TICK_DELAY_MS}>1 jour</button>
    <button data-action="${__ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_WEEK * __TICK_DELAY_MS}>1 semaine</button>
    <button data-action="${__ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_YEAR * __TICK_DELAY_MS}>1 an</button>
</div>

<button data-action="${__ACTIONS.TOGGLE___TICK}">Start</button>
<button data-action="${__ACTIONS.SWITCH_SCENE}" data-scene="${SCENES.MENU}">Switch to menu</button>

<div class="controls-save">
    <button data-action="${__ACTIONS.DOWNLOAD_SAVE}">download save</button>
    <button data-action="${__ACTIONS.UPLOAD_SAVE}">upload save</button>
    <button data-action="${__ACTIONS.CLEAR_SAVE}">clear save</button>
</div>
    `;
}

/**
 * @param {HTMLElement} el 
 */
function __controlscomp_update_toggle_button(el) {
    const s = store_get();
    const button = el.querySelector(`button[data-action="${__ACTIONS.TOGGLE___TICK}"]`);
    if (!button) throw new Error();
    button.textContent = s.ui_state.tick_interval_id === null ? "Start" : "Stop";
};

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function controlscomp_mount(container) {
    return comp_create_comp(container, "controls-comp", (el, add_cleanup) => {
        el.innerHTML = controlscomp_render();

        // TODO: PAS BESOIN de addEventListener ni removeEventListener car on a comp_delegate_click()
        // el.addEventListener("click", handle_click);
        add_cleanup(comp_delegate_click_with_enum(el, __ACTIONS, (action, event, btn) => {
            __controlscomp_handle_action(action, btn);
        }));

        add_cleanup(uisignal_on(UI_SIGNAL.TICK, () => __controlscomp_update_toggle_button(el)));
        __controlscomp_update_toggle_button(el);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 */
function __controlscomp_handle_action(action, btn) {
    const s = store_get();
    switch (action) {
        case __ACTIONS.SKIP_SECONDS: {
            const ms = utils_string_to_rkind(btn.dataset.amount);
            timeline_advance_by(s.world, ms);
            uisignal_emit(UI_SIGNAL.TICK);
            // save_timestamp(clock.timestamp);
            uistate_add_log(s.ui_state, `skip_seconds: ${ms} ms`);
            break;
        }
        case __ACTIONS.TOGGLE___TICK: {
            const s = store_get();
            if (s.ui_state.tick_interval_id != undefined) {
                clearInterval(s.ui_state.tick_interval_id);
                s.ui_state.tick_interval_id = undefined;
            }
            else {
                s.ui_state.tick_interval_id = setInterval(() => {
                    const s = store_get();
                    timeline_advance_by(s.world, __TICK_DELAY_MS);
                    uisignal_emit(UI_SIGNAL.TICK);
                    uistate_add_log(s.ui_state, "tick");
                }, __TICK_DELAY_MS);
            }
            uisignal_emit(UI_SIGNAL.TOGGLE_TICK);
            uistate_add_log(s.ui_state, "toggle_tick");
            break;
        }
        case __ACTIONS.SWITCH_SCENE: {
            const new_scene = btn.dataset.scene;
            if (new_scene != undefined) {
                //     if (!enum_is_enum_key(SCENES, new_scene)) { throw new Error(`Invalid scene: ${new_scene}`); }
                //     s.ui_state.scene = new_scene;
                //     uistate_add_log(s.ui_state, `switch_scene: ${new_scene}`);
                //     signalbus_emit(UISB, UI_SIGNAL.SCENE_SWITCHED, { new_scene: new_scene });
                scene_switch(s.ui_state, new_scene);
            }
            break;
        }
        case __ACTIONS.DOWNLOAD_SAVE: {
            save_download(s.world, s.ui_state);
            break;
        }
        case __ACTIONS.UPLOAD_SAVE: {
            save_upload().then((loaded => {
                if (loaded && loaded.world) {
                    timeline_advance_to(loaded.world, Date.now());
                    store_set_world(loaded.world);
                    uisignal_emit(UI_SIGNAL.SCENE_SWITCHED, { new_scene: s.ui_state.scene });
                }
            }));
            break;
        }
        case __ACTIONS.CLEAR_SAVE: {
            uistate_stop_tick(s.ui_state);
            save_clear();
            // runtime_init();
            break;
        }
        // case "hide_logs": {
        // TODO: si on le remet il faut mettre dans le parent le on() et pas dans le logs_comp directement
        //     signalbus_emit(UISB, "toggle_logs")
        //     break;
        // };
        default: {
            utils_assert_unreachable(action);
        }
    }
};
