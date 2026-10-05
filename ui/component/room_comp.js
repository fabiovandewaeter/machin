// ui/core/component/room_comp.js
// @ts-check

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/map/room.js").RoomID} RoomID
 * @typedef {import("../../engine/entity/entity.js").EntityID} EntityID
 * @typedef {import("../../engine/entity/entity.js").Entity} Entity
 */
import "../../utils/types.js"
import * as SB from "../../utils/signal_bus.js";
import * as ESB from "../../engine/core/signals.js";
import * as UISB from "../core/signals.js";
import * as Store from "../core/store.js";
import * as World from "../../engine/core/world.js";
import * as Repo from "../../utils/repository.js";
import * as Opt from "../../utils/option.js";
import * as Comp from "./core/comp.js";
import * as Utils from "../../utils/utils.js";
import * as Enum from "../../utils/enum.js";

const ACTIONS = Enum.create(/**@type {const}*/([
    "MOVE_ENTITY",
    "SELECT_ENTITY",
]));
/**@typedef {EnumKey<typeof ACTIONS>} Action*/

/**
 * @returns {string}
 */
export function render() {
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
export function update(el) {
    const s = Store.get();
    const current_room_id = get_current_room_id();
    const current_room = Opt.unwrap(Repo.get(s.world.galaxy.room_repo, current_room_id));

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
        const entity = Opt.unwrap(Repo.get(s.world.entity_repo, entity_id));
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
export function mount(container) {
    return Comp.create_comp(container, "room-comp", (el, add_cleanup) => {
        el.innerHTML = render();

        add_cleanup(Comp.delegate_click_with_enum(el, ACTIONS, (action, event, btn) => {
            handle_action(action, btn);
        }));

        add_cleanup(SB.on(ESB.BUS, "entity.room_id.changed", (payload) => {
            const current_room_id = get_current_room_id();
            if (payload.previous_room_id == current_room_id || payload.new_room_id == current_room_id) {
                update(el);
            }
        }));
        update(el);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 */
function handle_action(action, btn) {
    const s = Store.get();
    switch (action) {
        case ACTIONS.MOVE_ENTITY: {
            /**
             * TODO: faire en sorte que move_entity vérifie si l'exit choisie existe dans la room de l'entity
             * et si les conditions sont bonnes etc.
             */
            // TODO: griser si on a pas selectionne d'entity
            const selected_entity = get_selected_entity()
            World.move_entity(s.world, selected_entity.id, Utils.string_to_rkind(btn.dataset.roomId));
            break;
        }
        case ACTIONS.SELECT_ENTITY: {
            // const entity = Opt.unwrap(Repo.get(s.world.entity_repo, Utils.string_to_rkind(btn.dataset.entityId)));
            // console.log(entity);
            /** @type {EntityID} */
            const entity_id = Utils.string_to_rkind(btn.dataset.entityId);
            SB.emit(UISB.BUS, UISB.UI_SIGNAL.OPEN_ENTITY_PANEL, { entity_id });

            // change l'entity selectionnee
            const previous_selected_entity_id = s.ui_state.selected_entity_id;
            s.ui_state.selected_entity_id = Opt.some(entity_id);
            SB.emit(UISB.BUS, "ui_state.selected_entity_id.changed", {
                previous_selected_entity_id: Opt.unwrap_or_undefined(previous_selected_entity_id),
                new_selected_entity_id: entity_id,
            });
            break;
        }
        default: {
            Utils.assert_unreachable(action);
        }
    }
}

/**
 * @returns {Entity}
 */
function get_selected_entity() {
    const s = Store.get();
    const entity_id_opt = s.ui_state.selected_entity_id;
    const entity_id = Opt.unwrap(entity_id_opt);
    return Opt.unwrap(Repo.get(s.world.entity_repo, entity_id));
}

/**
 * TODO: ajouter système pour voir d'autres rooms sans déplacer le player mais il faut stocker l'information dans l'UI state
 */
/**
 * @returns {RoomID}
 */
function get_current_room_id() {
    const entity = get_selected_entity();
    return entity.room_id;
}
