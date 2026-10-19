// ui/core/component/inventory_comp.js

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/core/ids.types.js").RoomID} RoomID
 * @typedef {import("../../engine/core/ids.types.js").EntityID} EntityID
 * @typedef {import("../../engine/entity/entity.types.js").Entity} Entity
 * @typedef {import("../../engine/core/ids.types.js").InventoryID} InventoryID
 * @typedef {import("../../engine/inventory.js").Inventory} Inventory
 */
/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enginesignal_on } from "../../engine/core/signal/signal.js";
import { enum_create } from "../../utils/enum.js";
import { repository_get } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { store_get } from "../core/store.js";
import { comp_create_comp } from "./core/comp.js";

const __ACTIONS = enum_create(/**@type {const}*/([
]));
/**@typedef {EnumKey<typeof __ACTIONS>} Action*/

/**
 * @returns {string}
 */
function __inventorycomp_render() {
    return `
<h2>Inventory</h2>
items: <div class="items"></div>
    `;
}

/**
 * @param {HTMLElement} el
 * @param {InventoryID} inventory_id
 */
function __inventorycomp_update(el, inventory_id) {
    const s = store_get();
    const inventory = undefined_unwrap(repository_get(s.world.inventory_repo, inventory_id));

    const items_div = el.querySelector(".items");
    if (!items_div) throw new Error();
    const items = inventory.item_stack;
    items_div.innerHTML = items.map(({ id, item }) => (
        `<button data-action="" data-item-id="${id}">
            ${item.kind}
        </button>`
    )).join("");
}

/**
 * @param {HTMLElement} container 
 * @param {InventoryID} inventory_id
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function inventorycomp_mount(container, inventory_id) {
    return comp_create_comp(container, "inventory-comp", (el, add_cleanup) => {
        el.innerHTML = __inventorycomp_render();

        // add_cleanup(comp_delegate_click_with_enum(el, __ACTIONS, (action, event, btn) => {
        //     __inventorycomp_handle_action(action, btn);
        // }));

        // signals
        add_cleanup(enginesignal_on("inventory.item_stack.added", (payload) => {
            console.log("test1");
            if (payload.inventory_id == inventory_id) {
                __inventorycomp_update(el, inventory_id);
            }
        }));
        add_cleanup(enginesignal_on("inventory.item_stack.removed", (payload) => {
            console.log("test2");
            if (payload.inventory_id == inventory_id) {
                __inventorycomp_update(el, inventory_id);
            }
        }));

        __inventorycomp_update(el, inventory_id);
    });
}

// /**
//  * @param {Action} action
//  * @param {HTMLElement} btn
//  */
// function __inventorycomp_handle_action(action, btn) {
//     const s = store_get();
//     switch (action) {
//         case __ACTIONS.: {
//         }
//         default: {
//             utils_assert_unreachable(action);
//         }
//     }
// }
