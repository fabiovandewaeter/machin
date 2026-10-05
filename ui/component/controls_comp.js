// ui/core/component/controls_comp.js
// @ts-check

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 */
import "../../utils/types.js"
import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_WEEK, SECONDS_PER_YEAR } from "../../utils/const.js";
import * as SB from "../../utils/signal_bus.js";
import * as UISB from "../core/signals.js";
import * as Store from "../core/store.js";
import * as World from "../../engine/core/world.js";
import * as UIState from "../core/ui_state.js";
import * as Scene from "../scene/scene.js";
import * as Save from "../../utils/save.js";
import * as Comp from "./core/comp.js";
import * as Runtime from "../core/runtime.js";
import * as Utils from "../../utils/utils.js";
import * as Enum from "../../utils/enum.js";
import * as Opt from "../../utils/option.js";

const TICK_DELAY_MS = 1000;

const ACTIONS = Enum.create(/**@type {const}*/([
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
export function render() {
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
<button data-action="${ACTIONS.SWITCH_SCENE}" data-scene="${Scene.SCENES.MENU}">Switch to menu</button>

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
function update_toggle_button(el) {
    const s = Store.get();
    const button = el.querySelector(`button[data-action="${ACTIONS.TOGGLE_TICK}"]`);
    if (!button) throw new Error();
    button.textContent = s.ui_state.tick_interval_id === null ? "Start" : "Stop";
};

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function mount(container) {
    return Comp.create_comp(container, "controls-comp", (el, add_cleanup) => {
        el.innerHTML = render();

        // TODO: PAS BESOIN de addEventListener ni removeEventListener car on a Comp.delegate_click()
        // el.addEventListener("click", handle_click);
        add_cleanup(Comp.delegate_click_with_enum(el, ACTIONS, (action, event, btn) => {
            handle_action(action, btn);
        }));

        add_cleanup(SB.on(UISB.BUS, UISB.UI_SIGNAL.TICK, () => update_toggle_button(el)));
        update_toggle_button(el);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 */
function handle_action(action, btn) {
    const s = Store.get();
    switch (action) {
        case ACTIONS.SKIP_SECONDS: {
            const ms = Utils.string_to_rkind(btn.dataset.amount);
            World.advance_by(s.world, ms);
            SB.emit(UISB.BUS, UISB.UI_SIGNAL.TICK);
            // save_timestamp(clock.timestamp);
            UIState.add_log(s.ui_state, `skip_seconds: ${ms} ms`);
            break;
        }
        case ACTIONS.TOGGLE_TICK: {
            const s = Store.get();
            if (Opt.is_some(s.ui_state.tick_interval_id)) {
                clearInterval(s.ui_state.tick_interval_id.value);
                s.ui_state.tick_interval_id = Opt.none;
            }
            else {
                s.ui_state.tick_interval_id = Opt.some(setInterval(() => {
                    const s = Store.get();
                    World.advance_by(s.world, TICK_DELAY_MS);
                    SB.emit(UISB.BUS, UISB.UI_SIGNAL.TICK);
                    UIState.add_log(s.ui_state, "tick");
                }, TICK_DELAY_MS));
            }
            SB.emit(UISB.BUS, UISB.UI_SIGNAL.TOGGLE_TICK);
            UIState.add_log(s.ui_state, "toggle_tick");
            break;
        }
        case ACTIONS.SWITCH_SCENE: {
            const new_scene = btn.dataset.scene;
            if (new_scene) {
                if (!Enum.is_enum_value(Scene.SCENES, new_scene)) { throw new Error(`Invalid scene: ${new_scene}`); }
                s.ui_state.scene = new_scene;
                UIState.add_log(s.ui_state, `switch_scene: ${new_scene}`);
                SB.emit(UISB.BUS, UISB.UI_SIGNAL.SCENE_SWITCHED, { new_scene: new_scene });
            }
            break;
        }
        case ACTIONS.DOWNLOAD_SAVE: {
            Save.download(s.world, s.ui_state);
            break;
        }
        case ACTIONS.UPLOAD_SAVE: {
            Save.upload().then((loaded => {
                if (loaded && loaded.world) {
                    World.advance_to(loaded.world, Date.now());
                    Store.set_world(loaded.world);
                    SB.emit(UISB.BUS, UISB.UI_SIGNAL.SCENE_SWITCHED, { new_scene: s.ui_state.scene });
                }
            }));
            break;
        }
        case ACTIONS.CLEAR_SAVE: {
            UIState.stop_tick(s.ui_state);
            Save.clear();
            Runtime.init();
            break;
        }
        // case "hide_logs": {
        // TODO: si on le remet il faut mettre dans le parent le on() et pas dans le logs_comp directement
        //     SB.emit(UISB.BUS, "toggle_logs")
        //     break;
        // };
        default: {
            Utils.assert_unreachable(action);
        }
    }
};
