// utils/save.js
// @ts-check

/**
 * @typedef {import("../engine/core/world.js").World} World
 * @typedef {import("../ui/core/ui_state.js").UIState} UIState
 */
import "./types.js"
import * as Opt from "./option.js";
import * as SB from "./signal_bus.js";
import * as World from "../engine/core/world.js";
import * as UISB from "../ui/core/signals.js";
import * as Store from "../ui/core/store.js";
import * as UIState from "../ui/core/ui_state.js";

const STORAGE_KEY = "machin_save";
const CURRENT_VERSION = 0;

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
export function save(world, ui) {
    const save_struct = { ui, world };
    try {
        const json = JSON.stringify(save_struct);
        localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
        console.error("Could not save:", e);
    }
}

/**
 * @returns {Opt<SaveStruct>}
 */
export function load() {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (json) {
            const res = JSON.parse(json);
            if (res && res.world) {
                return Opt.some(res);
            }
        }
        return Opt.none;
    } catch (e) {
        console.error("Could not load save:", e);
        localStorage.removeItem(STORAGE_KEY);
        return Opt.none;
    }
}

export function clear() {
    localStorage.removeItem(STORAGE_KEY);
    const new_world = World.create();
    World.init(new_world);
    Store.set_world(new_world);
    Store.set_ui_state(UIState.create());
    Store.set_should_save(false);
    SB.emit(UISB.BUS, UISB.UI_SIGNAL.SCENE_SWITCHED, { new_scene: "MAIN" });
    // Runtime.clear();
    // const app = /**@type {HTMLElement}*/(document.getElementById("app"));
    // // Scene.render_current_scene(app, Runtime.WORLD, Runtime.UI_STATE);
    // Runtime.set_should_save(false);
    // window.zone.reload();
}

/**
 * @param {World} world
 * @param {UIState} ui
 */
export function download(world, ui) {
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

export function upload() {
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
