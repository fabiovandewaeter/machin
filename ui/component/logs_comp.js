// ui/component/logs_comp.js

/** @typedef {import("./core/utils.js").DestroyFunction} DestroyFunction */
import { uisignal_on } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";
import { store_get } from "../core/store/store.js";
import { comp_create_comp } from "./core/comp.js";

const __MAX_RENDERED_LOGS = 10;

/** @returns {string} */
export function logscomp_render() {
    return `<h1>Logs</h1><ul class="logs-list"></ul>`;
}

/**
 * @param {HTMLElement} container
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function logscomp_mount(container) {
    return comp_create_comp(container, "logs-comp", (element, add_cleanup) => {
        element.innerHTML = logscomp_render();
        const list = element.querySelector(".logs-list");
        if (!list) throw new Error("Missing logs list");
        const update = () => {
            list.replaceChildren(...store_get().ui_state.logs.slice(-__MAX_RENDERED_LOGS).map(log => {
                const item = document.createElement("li");
                item.textContent = log;
                return item;
            }));
        };
        add_cleanup(uisignal_on(UI_SIGNAL.LOGS, update));
        update();
    });
}
