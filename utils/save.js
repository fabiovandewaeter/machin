// utils/save.js

/**
 * @typedef {import("../engine/core/world/world.js").World} World
 * @typedef {import("../ui/core/ui_state/ui_state.js").UIState} UIState
 */
/** @template T @typedef {import("./option.js").Opt<T>} Opt */
import { world_create, world_init } from "../engine/core/world/world.js";
import { UISB } from "../ui/core/signal/signal.js";
import { UI_SIGNAL } from "../ui/core/signal/signal.types.js";
import { store_set_world, store_set_ui_state, store_set_should_save } from "../ui/core/store.js";
import { uistate_create } from "../ui/core/ui_state/ui_state.js";
import { some, none } from "./option.js";
import { signalbus_emit } from "./signal_bus.js";

const __STORAGE_KEY = "machin_save";
const __CURRENT_VERSION = 0;

/**
 * @typedef {Object} SaveStruct
 * @property {number} version
 * @property {World} world
 * @property {UIState} ui_state
 */

/**
 * @param {World} world
 * @param {UIState} ui
 */
export function save_save(world, ui) {
    const save_struct = { ui, world };
    try {
        const json = JSON.stringify(save_struct);
        localStorage.setItem(__STORAGE_KEY, json);
    } catch (e) {
        console.error("Could not save:", e);
    }
}

/**
 * @returns {Opt<SaveStruct>}
 */
export function save_load() {
    try {
        const json = localStorage.getItem(__STORAGE_KEY);
        if (json) {
            const res = JSON.parse(json);
            if (res && res.world) {
                return some(res);
            }
        }
        return none;
    } catch (e) {
        console.error("Could not load save:", e);
        localStorage.removeItem(__STORAGE_KEY);
        return none;
    }
}

export function save_clear() {
    localStorage.removeItem(__STORAGE_KEY);
    const new_world = world_create();
    world_init(new_world);
    store_set_world(new_world);
    store_set_ui_state(uistate_create());
    store_set_should_save(false);
    signalbus_emit(UISB, UI_SIGNAL.SCENE_SWITCHED, { new_scene: "MAIN" });
    // Runtime.clear();
    // const app = /**@type {HTMLElement}*/(document.getElementById("app"));
    // // scene_render_current_scene(app, Runtime.WORLD, Runtime.UI_STATE);
    // Runtime.set_should_save(false);
    // window.zone.reload();
}

/**
 * @param {World} world
 * @param {UIState} ui
 */
export function save_download(world, ui) {
    const save_struct = { world, ui };
    const json = JSON.stringify(save_struct, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "save.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function save_upload() {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = (e) => {
            const target = e.target;
            if (!(target instanceof HTMLInputElement)) throw new Error();
            const file = target.files?.[0];
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const model = JSON.parse(/**@type {string}*/(event.target?.result));
                    // TODO: valider que les champs sont bons
                    resolve(model);
                } catch (err) {
                    console.error("Fichier invalide");
                    resolve(null);
                }
            };
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
        };
        input.click();
    });
}
