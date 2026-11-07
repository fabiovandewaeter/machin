// ui/core/game.js

/** @typedef {import("./save/save.types.js").GameSave} GameSave */
import { enginesignals_init } from "../../engine/core/signal/signal.js";
import { timeline_advance_by, timeline_advance_to_now, timeline_init } from "../../engine/core/timeline/timeline.js";
import { world_create } from "../../engine/core/world/world.js";
import { world_init } from "../../engine/core/world/world_init.js";
import { repository_get } from "../../utils/repository.js";
import { result_is_err } from "../../utils/result.js";
import { save_clear, save_download, save_load, save_save, save_upload } from "../../utils/save.js";
import { gamesave_create, gamesave_parse } from "./save/save.js";
import { uisignal_emit } from "./signal/signal.js";
import { UI_SIGNAL } from "./signal/signal.types.js";
import { store_get, store_set } from "./store/store.js";
import { uistate_add_log, uistate_create } from "./ui_state/ui_state.js";

const __TICK_DELAY_MS = 1000;
/** @type {number|undefined} */
let __tick_interval_id;

export function game_init() {
    enginesignals_init();
    timeline_init();
    const loaded = save_load();
    const save = result_is_err(loaded) ? undefined : gamesave_parse(loaded.value);
    __game_replace(save);
    if (result_is_err(loaded) || loaded.value !== undefined && !save) {
        const store = store_get();
        store.should_save = false;
        uistate_add_log(store.ui_state, "Sauvegarde illisible ou incompatible ; sauvegarde automatique désactivée");
    }
}

/** @returns {boolean} */
export function game_is_running() {
    return __tick_interval_id !== undefined;
}

export function game_stop() {
    if (__tick_interval_id === undefined) return;
    clearInterval(__tick_interval_id);
    __tick_interval_id = undefined;
    uisignal_emit(UI_SIGNAL.TOGGLE_TICK);
}

export function game_toggle_tick() {
    if (game_is_running()) {
        game_stop();
    } else {
        let previous_tick_at = Date.now();
        __tick_interval_id = setInterval(() => {
            const now = Date.now();
            const store = store_get();
            timeline_advance_by(store.world, Math.max(0, now - previous_tick_at));
            previous_tick_at = now;
            uistate_add_log(store.ui_state, "tick");
        }, __TICK_DELAY_MS);
        uisignal_emit(UI_SIGNAL.TOGGLE_TICK);
    }
    uistate_add_log(store_get().ui_state, "toggle_tick");
}

/** @param {number} milliseconds */
export function game_skip_time(milliseconds) {
    const store = store_get();
    timeline_advance_by(store.world, milliseconds);
    uistate_add_log(store.ui_state, `skip_time: ${milliseconds} ms`);
}

export function game_save() {
    const store = store_get();
    if (store.should_save) save_save(gamesave_create(store));
}

export function game_download_save() {
    save_download(gamesave_create(store_get()));
}

export async function game_upload_save() {
    const store = store_get();
    const data = await save_upload();
    if (data === undefined || store_get() !== store) return;
    const save = gamesave_parse(data);
    if (!save) {
        uistate_add_log(store.ui_state, "Sauvegarde invalide ou incompatible");
        return;
    }
    __game_replace(save);
}

export function game_reset() {
    if (!save_clear()) {
        uistate_add_log(store_get().ui_state, "Impossible d’effacer la sauvegarde");
        return;
    }
    __game_replace();
}

/** @param {GameSave} [save] */
function __game_replace(save) {
    game_stop();
    uisignal_emit(UI_SIGNAL.GAME_REPLACING);
    const world = save?.world ?? world_create();
    if (!save) world_init(world);
    const ui_state = uistate_create(save?.ui_state);
    if (ui_state.selected_entity_id === undefined || !repository_get(world.entity_repo, ui_state.selected_entity_id)) {
        ui_state.selected_entity_id = world.entity_repo.elements[0]?.id;
    }
    store_set({ world, ui_state, should_save: true });
    timeline_advance_to_now(world);
    uisignal_emit(UI_SIGNAL.SCENE_SWITCHED, { new_scene: ui_state.scene });
}
