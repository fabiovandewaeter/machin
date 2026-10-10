// ui/core/component/room_comp.js
// @ts-check

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/map/room.js").RoomID} RoomID
 * @typedef {import("../../engine/entity/entity.js").EntityID} EntityID
 * @typedef {import("../../engine/entity/entity.js").Entity} Entity
 */
import { ESB } from "../../engine/core/signals.js";
import { world_move_entity } from "../../engine/core/world.js";
import { enum_create } from "../../utils/enum.js";
import { option_unwrap, some, option_unwrap_or_undefined } from "../../utils/option.js";
import { repository_get } from "../../utils/repository.js";
import { signalbus_on, signalbus_emit } from "../../utils/signal_bus.js";
import "../../utils/types.js"
import { undefined_unwrap } from "../../utils/undefined.js";
import { utils_string_to_rkind, utils_assert_unreachable } from "../../utils/utils.js";
import { UISB, UI_SIGNAL } from "../core/signals.js";
import { store_get } from "../core/store.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "./core/comp.js";

const ACTIONS = enum_create(/**@type {const}*/([
    "MOVE_ENTITY",
    "SELECT_ENTITY",
]));
/**@typedef {EnumKey<typeof ACTIONS>} Action*/

/**
 * @returns {string}
 */
export function roomcomp_render() {
    return `
<h1>Room</h1>
id: <span class="room-id"></span>
kind: <span class="room-kind"></span>
name: <span class="room-name"></span>
<div class="visible-entities"></div>
<div class="connected-rooms"></div>
    `;
}

/**
 * @param {HTMLElement} el
 */
export function roomcomp_update(el) {
    const s = store_get();
    const current_room_id = roomcomp_get_current_room_id();
    const current_room = undefined_unwrap(repository_get(s.world.galaxy.room_repo, current_room_id));

    const id = el.querySelector(".room-id");
    const kind = el.querySelector(".room-kind");
    const name = el.querySelector(".room-name");

    if (!id || !kind || !name) throw new Error();

    id.textContent = current_room.id.toString();
    kind.textContent = current_room.kind
    name.textContent = current_room.name;

    // exit list
    const exit_list = el.querySelector(".connected-rooms");
    if (!exit_list) return;
    exit_list.innerHTML = Object.entries(current_room.exits).map(([name, exit]) => (
        `<button data-action="${ACTIONS.MOVE_ENTITY}" data-room-id="${exit.target_id}">
            ${name}
        </button>`
    )).join("");

    const entity_list = el.querySelector(".visible-entities");
    if (!entity_list) return;
    let entity_list_string = "";
    for (const entity_id of current_room.entities) {
        const entity = undefined_unwrap(repository_get(s.world.entity_repo, entity_id));
        entity_list_string += `<button data-action="${ACTIONS.SELECT_ENTITY}" data-entity-id="${entity.id}">
            ${entity.name}
        </button>`
    }
    entity_list.innerHTML = entity_list_string;
}

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function roomcomp_mount(container) {
    return comp_create_comp(container, "room-comp", (el, add_cleanup) => {
        el.innerHTML = roomcomp_render();

        add_cleanup(comp_delegate_click_with_enum(el, ACTIONS, (action, event, btn) => {
            roomcomp_handle_action(action, btn);
        }));

        add_cleanup(signalbus_on(ESB, "entity.room_id.changed", (payload) => {
            const current_room_id = roomcomp_get_current_room_id();
            if (payload.previous_room_id == current_room_id || payload.new_room_id == current_room_id) {
                roomcomp_update(el);
            }
        }));
        roomcomp_update(el);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 */
function roomcomp_handle_action(action, btn) {
    const s = store_get();
    switch (action) {
        case ACTIONS.MOVE_ENTITY: {
            /**
             * TODO: faire en sorte que move_entity vérifie si l'exit choisie existe dans la room de l'entity
             * et si les conditions sont bonnes etc.
             */
            // TODO: griser si on a pas selectionne d'entity
            const selected_entity = roomcomp_get_selected_entity()
            world_move_entity(s.world, selected_entity.id, utils_string_to_rkind(btn.dataset.roomId));
            break;
        }
        case ACTIONS.SELECT_ENTITY: {
            // const entity = undefined_unwrap(repository_get(s.world.entity_repo, utils_string_to_rkind(btn.dataset.entityId)));
            // console.log(entity);
            /** @type {EntityID} */
            const entity_id = utils_string_to_rkind(btn.dataset.entityId);
            signalbus_emit(UISB, UI_SIGNAL.OPEN_ENTITY_PANEL, { entity_id });

            // change l'entity selectionnee
            const previous_selected_entity_id = s.ui_state.selected_entity_id;
            s.ui_state.selected_entity_id = some(entity_id);
            signalbus_emit(UISB, "ui_state.selected_entity_id.changed", {
                previous_selected_entity_id: option_unwrap_or_undefined(previous_selected_entity_id),
                new_selected_entity_id: entity_id,
            });
            break;
        }
        default: {
            utils_assert_unreachable(action);
        }
    }
}

/**
 * @returns {Entity}
 */
function roomcomp_get_selected_entity() {
    const s = store_get();
    const entity_id_opt = s.ui_state.selected_entity_id;
    const entity_id = option_unwrap(entity_id_opt);
    return undefined_unwrap(repository_get(s.world.entity_repo, entity_id));
}

/**
 * TODO: ajouter système pour voir d'autres rooms sans déplacer le player mais il faut stocker l'information dans l'UI state
 */
/**
 * @returns {RoomID}
 */
function roomcomp_get_current_room_id() {
    const entity = roomcomp_get_selected_entity();
    return entity.room_id;
}
