// ui/core/save/save.js

/**
 * @typedef {import("./save.types.js").GameSave} GameSave
 * @typedef {import("../store/store.types.js").GameStore} GameStore
 */
import { world_restore } from "../../../engine/core/world/world_restore.js";
import { SCENES } from "../../scene/scene.types.js";

const __SAVE_VERSION = 0;

/**
 * @param {GameStore} store
 * @returns {GameSave}
 */
export function gamesave_create({ world, ui_state }) {
    return {
        version: __SAVE_VERSION,
        world,
        ui_state: { scene: ui_state.scene, selected_entity_id: ui_state.selected_entity_id },
    };
}

/**
 * @param {unknown} value
 * @returns {GameSave|undefined}
 */
export function gamesave_parse(value) {
    if (!value || typeof value !== "object") return undefined;
    const save = /** @type {GameSave} */ (value);
    if (save.version !== __SAVE_VERSION) return undefined;
    const ui_state = save.ui_state ?? { scene: SCENES.MAIN, selected_entity_id: undefined };
    if (typeof ui_state !== "object" || Array.isArray(ui_state) || typeof ui_state.scene !== "string"
        || !Object.hasOwn(SCENES, ui_state.scene)) {
        return undefined;
    }
    const selected_entity_id = ui_state.selected_entity_id ?? undefined;
    if (selected_entity_id !== undefined && (!Number.isSafeInteger(selected_entity_id) || selected_entity_id < 0)) {
        return undefined;
    }
    try {
        return {
            version: __SAVE_VERSION,
            world: world_restore(save.world),
            ui_state: { scene: ui_state.scene, selected_entity_id },
        };
    } catch {
        return undefined;
    }
}
