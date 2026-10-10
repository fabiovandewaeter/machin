// ui/core/component/controls_comp.js
// @ts-check

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 */
import "../../utils/types.js"
import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_WEEK, SECONDS_PER_YEAR } from "../../utils/const.js";
import { utils_assert_unreachable, utils_string_to_rkind } from "../../utils/utils.js";
import { runtime_init } from "../core/runtime.js";
import { save_clear, save_download, save_upload } from "../../utils/save.js";
import { uistate_add_log, uistate_stop_tick } from "../core/ui_state.js";
import { signalbus_emit, signalbus_off, signalbus_on } from "../../utils/signal_bus.js";
import { store_get, store_set_world } from "../core/store.js";
import { world_advance_by, world_advance_to } from "../../engine/core/world.js";
import { enum_create, enum_is_enum_key } from "../../utils/enum.js";
import { none, option_is_none, option_is_some, some } from "../../utils/option.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "./core/comp.js";
import { SCENES } from "../scene/scene.js";
import { UI_SIGNAL, UISB } from "../core/signals.js";

const TICK_DELAY_MS = 1000;

const ACTIONS = enum_create(/**@type {const}*/([
    "SKIP_SECONDS",
    "TOGGLE_TICK",
    "SWITCH_SCENE",
    "DOWNLOAD_SAVE",
    "UPLOAD_SAVE",
    "CLEAR_SAVE",
]));
/**@typedef {EnumKey<typeof ACTIONS>} Action*/

/**
 * @returns {string}
 */
export function controlscomp_render() {
    return `
<div class="controls-time">
    <button data-action="${ACTIONS.SKIP_SECONDS}" data-amount=${TICK_DELAY_MS}>1 seconde</button>
    <button data-action="${ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_MINUTE * TICK_DELAY_MS}>1 minute</button>
    <button data-action="${ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_HOUR * TICK_DELAY_MS}>1 heure</button>
    <button data-action="${ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_DAY * TICK_DELAY_MS}>1 jour</button>
    <button data-action="${ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_WEEK * TICK_DELAY_MS}>1 semaine</button>
    <button data-action="${ACTIONS.SKIP_SECONDS}" data-amount=${SECONDS_PER_YEAR * TICK_DELAY_MS}>1 an</button>
</div>

<button data-action="${ACTIONS.TOGGLE_TICK}">Start</button>
<button data-action="${ACTIONS.SWITCH_SCENE}" data-scene="${SCENES.MENU}">Switch to menu</button>

<div class="controls-save">
    <button data-action="${ACTIONS.DOWNLOAD_SAVE}">download save</button>
    <button data-action="${ACTIONS.UPLOAD_SAVE}">upload save</button>
    <button data-action="${ACTIONS.CLEAR_SAVE}">clear save</button>
</div>
    `;
}

/**
 * @param {HTMLElement} el 
 */
function controlscomp_update_toggle_button(el) {
    const s = store_get();
    const button = el.querySelector(`button[data-action="${ACTIONS.TOGGLE_TICK}"]`);
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
        add_cleanup(comp_delegate_click_with_enum(el, ACTIONS, (action, event, btn) => {
            controlscomp_handle_action(action, btn);
        }));

        add_cleanup(signalbus_on(UISB, UI_SIGNAL.TICK, () => controlscomp_update_toggle_button(el)));
        controlscomp_update_toggle_button(el);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 */
function controlscomp_handle_action(action, btn) {
    const s = store_get();
    switch (action) {
        case ACTIONS.SKIP_SECONDS: {
            const ms = utils_string_to_rkind(btn.dataset.amount);
            world_advance_by(s.world, ms);
            signalbus_emit(UISB, UI_SIGNAL.TICK);
            // save_timestamp(clock.timestamp);
            uistate_add_log(s.ui_state, `skip_seconds: ${ms} ms`);
            break;
        }
        case ACTIONS.TOGGLE_TICK: {
            const s = store_get();
            if (option_is_some(s.ui_state.tick_interval_id)) {
                clearInterval(s.ui_state.tick_interval_id.value);
                s.ui_state.tick_interval_id = none;
            }
            else {
                s.ui_state.tick_interval_id = some(setInterval(() => {
                    const s = store_get();
                    world_advance_by(s.world, TICK_DELAY_MS);
                    signalbus_emit(UISB, UI_SIGNAL.TICK);
                    uistate_add_log(s.ui_state, "tick");
                }, TICK_DELAY_MS));
            }
            signalbus_emit(UISB, UI_SIGNAL.TOGGLE_TICK);
            uistate_add_log(s.ui_state, "toggle_tick");
            break;
        }
        case ACTIONS.SWITCH_SCENE: {
            const new_scene = btn.dataset.scene;
            if (new_scene) {
                if (!enum_is_enum_key(SCENES, new_scene)) { throw new Error(`Invalid scene: ${new_scene}`); }
                s.ui_state.scene = new_scene;
                uistate_add_log(s.ui_state, `switch_scene: ${new_scene}`);
                signalbus_emit(UISB, UI_SIGNAL.SCENE_SWITCHED, { new_scene: new_scene });
            }
            break;
        }
        case ACTIONS.DOWNLOAD_SAVE: {
            save_download(s.world, s.ui_state);
            break;
        }
        case ACTIONS.UPLOAD_SAVE: {
            save_upload().then((loaded => {
                if (loaded && loaded.world) {
                    world_advance_to(loaded.world, Date.now());
                    store_set_world(loaded.world);
                    signalbus_emit(UISB, UI_SIGNAL.SCENE_SWITCHED, { new_scene: s.ui_state.scene });
                }
            }));
            break;
        }
        case ACTIONS.CLEAR_SAVE: {
            uistate_stop_tick(s.ui_state);
            save_clear();
            runtime_init();
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
