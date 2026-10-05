// ui/core/component/entity_comp.js
// @ts-check

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/entity/entity.js").EntityID} EntityID
 */
import "../../utils/types.js"
import * as SB from "../../utils/signal_bus.js";
import * as ESB from "../../engine/core/signals.js";
import * as UISB from "../core/signals.js";
import * as Store from "../core/store.js";
import * as Repo from "../../utils/repository.js";
import * as Opt from "../../utils/option.js";
import * as Comp from "./core/comp.js";
import * as Enum from "../../utils/enum.js";
import * as Utils from "../../utils/utils.js";

const ACTIONS = Enum.create(/**@type {const}*/([
    "CLOSE_PANEL",
]));
/**@typedef {EnumKey<typeof ACTIONS>} Action*/

/**
 * @returns {string}
 */
export function render() {
    return `
<h1>Entity</h1>
<button data-action="${ACTIONS.CLOSE_PANEL}">Close</button>
<p>id: <span class="entity-id"></span></p>
<p>name: <span class="entity-name"></span></p>
<p>room_id: <span class="entity-room-id"></span></p>
    `;
}

/**
 * @param {HTMLElement} el
 * @param {EntityID} entity_id
 */
export function update(el, entity_id) {
    const s = Store.get();
    const entity = Opt.unwrap(Repo.get(s.world.entity_repo, entity_id));

    const span_id = el.querySelector(".entity-id");
    const span_name = el.querySelector(".entity-name");
    const span_room_id = el.querySelector(".entity-room-id");

    if (!span_id || !span_name || !span_room_id) throw new Error();

    span_id.textContent = entity.id.toString();
    span_name.textContent = entity.name;
    span_room_id.textContent = entity.room_id.toString();
}

/**
 * @param {HTMLElement} container 
 * @param {EntityID} entity_id
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function mount(container, entity_id) {
    return Comp.create_comp(container, "entity-comp", (el, add_cleanup) => {
        el.innerHTML = render();

        add_cleanup(Comp.delegate_click_with_enum(el, ACTIONS, (action, event, btn) => {
            handle_action(action, btn, entity_id);
        }));


        add_cleanup(SB.on(ESB.BUS, "entity.name.changed", (payload) => {
            if (payload.entity_id === entity_id) update(el, entity_id);
        }));
        add_cleanup(SB.on(ESB.BUS, "entity.room_id.changed", (payload) => {
            if (payload.entity_id === entity_id) update(el, entity_id);
        }));

        update(el, entity_id);
    });
}

/**
 * @param {Action} action
 * @param {HTMLElement} btn
 * @param {EntityID} entity_id
 */
function handle_action(action, btn, entity_id) {
    const s = Store.get();
    switch (action) {
        case ACTIONS.CLOSE_PANEL: {
            SB.emit(UISB.BUS, UISB.UI_SIGNAL.CLOSE_ENTITY_PANEL);
            break;
        }
        default: {
            Utils.assert_unreachable(action);
        }
    }
}
