/** @typedef {import("../component/core/utils.js").DestroyFunction} DestroyFunction */
import { enginesignals_clear_handlers } from "../../engine/core/signal/signal.js";
import { scene_mount } from "../scene/scene.js";
import { game_init, game_save, game_stop } from "./game.js";
import { uisignals_clear_handlers, uisignals_init } from "./signal/signal.js";
import { store_get } from "./store.js";

let __initialized = false;
let __stopped = false;
/** @type {DestroyFunction|undefined} */
let __destroy_scene;

function __runtime_save() {
    if (__initialized && !__stopped) game_save();
}

function __runtime_crash() {
    if (__stopped) return;
    __stopped = true;
    if (__initialized) store_get().should_save = false;
    try {
        game_stop();
        __destroy_scene?.();
    } finally {
        enginesignals_clear_handlers();
        uisignals_clear_handlers();
        const app = document.getElementById("app");
        if (app) app.textContent = "Erreur fatale. Rechargez la page pour redémarrer.";
    }
}

export function runtime_init() {
    if (__initialized || __stopped) return;
    const app = document.getElementById("app");
    if (!app) throw new Error("Missing application container");
    uisignals_init();
    game_init();
    __initialized = true;
    __destroy_scene = scene_mount(app);
    app.tabIndex = -1;
    app.focus();
    window.addEventListener("beforeunload", __runtime_save);
    window.addEventListener("pagehide", __runtime_save);
}

window.addEventListener("error", __runtime_crash);
window.addEventListener("unhandledrejection", __runtime_crash);
runtime_init();
