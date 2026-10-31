// ui/component/room_comp.js

/**
 * @typedef {import("./core/utils.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/core/ids.types.js").RoomID} RoomID
 * @typedef {import("../../engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("../../engine/entity/entity.types.js").Entity} Entity
 */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enginesignal_on } from "../../engine/core/signal/signal.js";
import { world_mine, world_move_entity } from "../../engine/core/world/world.js";
import { ore_can_be_extracted } from "../../engine/extraction/ore.js";
import { enum_create } from "../../utils/enum.js";
import { repository_get } from "../../utils/repository.js";
import { result_is_err } from "../../utils/result.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { utils_string_to_rkind, utils_assert_unreachable } from "../../utils/utils.js";
import { uisignal_emit, uisignal_on } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store/store.js";
import { uistate_add_log, uistate_select_entity } from "../core/ui_state/ui_state.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "./core/comp.js";

const __ACTIONS = enum_create(/** @type {const} */ ([
    "MOVE_ENTITY",
    "SELECT_ENTITY",
    "EXTRACT",
]));
/** @typedef {EnumKey<typeof __ACTIONS>} Action */

/** @returns {string} */
function __roomcomp_render() {
    return `
<h1>Room</h1>
id: <span class="room-id"></span>
kind: <span class="room-kind"></span>
name: <span class="room-name"></span>
exits: <div class="connected-rooms"></div>
entities: <div class="visible-entities"></div>
content: <div class="content"></div>
    `;
}

/** @param {HTMLElement} element */
function __roomcomp_update(element) {
    const store = store_get();
    const entity = __roomcomp_get_selected_entity();
    element.hidden = entity === undefined;
    if (!entity) return;
    const room = undefined_unwrap(repository_get(store.world.galaxy.room_repo, entity.room_id));
    const id = element.querySelector(".room-id");
    const kind = element.querySelector(".room-kind");
    const name = element.querySelector(".room-name");
    const exits = element.querySelector(".connected-rooms");
    const entities = element.querySelector(".visible-entities");
    const content = element.querySelector(".content");
    if (!id || !kind || !name || !exits || !entities || !content) throw new Error("Missing room fields");
    id.textContent = String(room.id);
    kind.textContent = room.kind;
    name.textContent = room.name;
    exits.replaceChildren(...Object.entries(room.exits).map(([label, exit]) => {
        const button = document.createElement("button");
        button.dataset.action = __ACTIONS.MOVE_ENTITY;
        button.dataset.roomId = String(exit.target_id);
        button.textContent = label;
        return button;
    }));
    entities.replaceChildren(...room.entities.map(entity_id => {
        const visible_entity = undefined_unwrap(repository_get(store.world.entity_repo, entity_id));
        const button = document.createElement("button");
        button.dataset.action = __ACTIONS.SELECT_ENTITY;
        button.dataset.entityId = String(entity_id);
        button.textContent = visible_entity.name;
        return button;
    }));
    content.replaceChildren(...room.content.map(ore => {
        const button = document.createElement("button");
        button.dataset.action = __ACTIONS.EXTRACT;
        button.dataset.internalId = String(ore.internal_id);
        button.textContent = String(ore.required_mining_level);
        button.disabled = !entity.tool || !entity.tool.compatible_actions.includes("MINING") || !ore_can_be_extracted(ore, entity.tool);
        return button;
    }));
}

/**
 * @param {HTMLElement} container
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function roomcomp_mount(container) {
    return comp_create_comp(container, "room-comp", (element, add_cleanup) => {
        element.innerHTML = __roomcomp_render();
        add_cleanup(comp_delegate_click_with_enum(element, __ACTIONS, (action, event, button) => {
            __roomcomp_handle_action(action, button);
        }));
        const update_room = (/** @type {{room_id: RoomID}} */ payload) => {
            if (payload.room_id === __roomcomp_get_selected_entity()?.room_id) __roomcomp_update(element);
        };
        add_cleanup(enginesignal_on("entity.room_id.changed", payload => {
            if (payload.entity_id === store_get().ui_state.selected_entity_id) __roomcomp_update(element);
        }));
        add_cleanup(enginesignal_on("room.entities.added", update_room));
        add_cleanup(enginesignal_on("room.entities.removed", update_room));
        add_cleanup(enginesignal_on("room.content.added", update_room));
        add_cleanup(enginesignal_on("room.content.removed", update_room));
        add_cleanup(enginesignal_on("room.exits.set", update_room));
        add_cleanup(enginesignal_on("room.exits.deleted", update_room));
        add_cleanup(uisignal_on("ui_state.selected_entity_id.changed", () => __roomcomp_update(element)));
        __roomcomp_update(element);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} button
 */
function __roomcomp_handle_action(action, button) {
    const store = store_get();
    switch (action) {
        case __ACTIONS.MOVE_ENTITY: {
            const entity = __roomcomp_get_selected_entity();
            if (!entity) return;
            const result = world_move_entity(store.world, entity.id, utils_string_to_rkind(button.dataset.roomId));
            if (result_is_err(result)) uistate_add_log(store.ui_state, result.error);
            break;
        }
        case __ACTIONS.SELECT_ENTITY: {
            /** @type {EntityID} */
            const entity_id = utils_string_to_rkind(button.dataset.entityId);
            if (!repository_get(store.world.entity_repo, entity_id)) return;
            uistate_select_entity(store.ui_state, entity_id);
            uisignal_emit(UI_SIGNAL.OPEN_ENTITY_PANEL, { entity_id });
            break;
        }
        case __ACTIONS.EXTRACT: {
            const entity = __roomcomp_get_selected_entity();
            if (!entity) return;
            const result = world_mine(store.world, entity.id, utils_string_to_rkind(button.dataset.internalId));
            if (result_is_err(result)) uistate_add_log(store.ui_state, result.error);
            break;
        }
        default:
            utils_assert_unreachable(action);
    }
}

/** @returns {Entity|undefined} */
function __roomcomp_get_selected_entity() {
    const store = store_get();
    const entity_id = store.ui_state.selected_entity_id;
    return entity_id === undefined ? undefined : repository_get(store.world.entity_repo, entity_id);
}
