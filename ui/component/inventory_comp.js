/**
 * @typedef {import("./core/utils.js").DestroyFunction} DestroyFunction
 * @typedef {import("../../engine/core/ids.types.js").InventoryID} InventoryID
 */
import { enginesignal_on } from "../../engine/core/signal/signal.js";
import { repository_get } from "../../utils/repository.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { store_get } from "../core/store.js";
import { comp_create_comp } from "./core/comp.js";

/**
 * @param {HTMLElement} element
 * @param {InventoryID} inventory_id
 */
function __inventorycomp_update(element, inventory_id) {
    const inventory = undefined_unwrap(repository_get(store_get().world.inventory_repo, inventory_id));
    const items = element.querySelector(".items");
    if (!items) throw new Error("Missing inventory items");
    items.replaceChildren(...inventory.item_stack.map(({ id, item }) => {
        const button = document.createElement("button");
        button.dataset.itemId = String(id);
        button.textContent = item.kind;
        return button;
    }));
}

/**
 * @param {HTMLElement} container
 * @param {InventoryID} inventory_id
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function inventorycomp_mount(container, inventory_id) {
    return comp_create_comp(container, "inventory-comp", (element, add_cleanup) => {
        element.innerHTML = `<h2>Inventory</h2>items: <div class="items"></div>`;
        const update = (/** @type {{inventory_id: InventoryID}} */ payload) => {
            if (payload.inventory_id === inventory_id) __inventorycomp_update(element, inventory_id);
        };
        add_cleanup(enginesignal_on("inventory.item_stack.added", update));
        add_cleanup(enginesignal_on("inventory.item_stack.removed", update));
        __inventorycomp_update(element, inventory_id);
    });
}
