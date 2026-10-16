// ui/core/component/room_comp.js


/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/core/ids.types.js").RoomID} RoomID
 * @typedef {import("../../engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("../../engine/entity/entity.js").Entity} Entity
 */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enginesignal_on } from "../../engine/core/signal/signal.js";
import { world_move_entity } from "../../engine/core/world/world.js";
import { enum_create } from "../../utils/enum.js";
import { repository_get } from "../../utils/repository.js";
import { signalbus_on, signalbus_emit } from "../../utils/signal_bus.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { utils_string_to_rkind, utils_assert_unreachable } from "../../utils/utils.js";
import { uisignal_emit } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store.js";
import { comp_create_comp, comp_delegate_click_with_enum } from "./core/comp.js";

const __ACTIONS = enum_create(/**@type {const}*/([
    "MOVE_ENTITY",
    "SELECT_ENTITY",
]));
/**@typedef {EnumKey<typeof __ACTIONS>} Action*/

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
    const current_room_id_opt = __roomcomp_get_current_room_id();
    if (current_room_id_opt == undefined) {
        console.warn(`current_room_id_opt vide donc room_comp ne peut pas être update`);
        return;
    }
    const current_room = undefined_unwrap(repository_get(s.world.galaxy.room_repo, current_room_id_opt));

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
        `<button data-action="${__ACTIONS.MOVE_ENTITY}" data-room-id="${exit.target_id}">
            ${name}
        </button>`
    )).join("");

    const entity_list = el.querySelector(".visible-entities");
    if (!entity_list) return;
    let entity_list_string = "";
    for (const entity_id of current_room.entities) {
        const entity = undefined_unwrap(repository_get(s.world.entity_repo, entity_id));
        entity_list_string += `<button data-action="${__ACTIONS.SELECT_ENTITY}" data-entity-id="${entity.id}">
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

        add_cleanup(comp_delegate_click_with_enum(el, __ACTIONS, (action, event, btn) => {
            __roomcomp_handle_action(action, btn);
        }));

        add_cleanup(enginesignal_on("entity.room_id.changed", (payload) => {
            const current_room_id = __roomcomp_get_current_room_id();
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
function __roomcomp_handle_action(action, btn) {
    const s = store_get();
    switch (action) {
        case __ACTIONS.MOVE_ENTITY: {
            /**
             * TODO: faire en sorte que move_entity vérifie si l'exit choisie existe dans la room de l'entity
             * et si les conditions sont bonnes etc.
             */
            // TODO: griser si on a pas selectionne d'entity
            const selected_entity_opt = undefined_unwrap(__roomcomp_get_selected_entity());
            world_move_entity(s.world, selected_entity_opt.id, utils_string_to_rkind(btn.dataset.roomId));
            break;
        }
        case __ACTIONS.SELECT_ENTITY: {
            // const entity = undefined_unwrap(repository_get(s.world.entity_repo, utils_string_to_rkind(btn.dataset.entityId)));
            // console.log(entity);
            /** @type {EntityID} */
            const entity_id = utils_string_to_rkind(btn.dataset.entityId);
            uisignal_emit(UI_SIGNAL.OPEN_ENTITY_PANEL, { entity_id });

            // change l'entity selectionnee
            const previous_selected_entity_id = s.ui_state.selected_entity_id;
            s.ui_state.selected_entity_id = entity_id;
            uisignal_emit("ui_state.selected_entity_id.changed", {
                previous_selected_entity_id: previous_selected_entity_id,
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
 * @returns {Entity|undefined}
 */
function __roomcomp_get_selected_entity() {
    const s = store_get();
    const entity_id_opt = s.ui_state.selected_entity_id;
    if (entity_id_opt == undefined) return undefined;
    return undefined_unwrap(repository_get(s.world.entity_repo, entity_id_opt));
}

/**
 * TODO: ajouter système pour voir d'autres rooms sans déplacer le player mais il faut stocker l'information dans l'UI state
 */
/**
 * @returns {RoomID|undefined}
 */
function __roomcomp_get_current_room_id() {
    const s = store_get();
    const entity_id_opt = s.ui_state.selected_entity_id;
    if (entity_id_opt == undefined) return undefined;
    const entity = undefined_unwrap(repository_get(s.world.entity_repo, entity_id_opt));
    return entity.room_id;
}
