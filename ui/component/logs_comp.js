// ui/core/component/logs_comp.js
// @ts-check

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 */
import { signalbus_on } from "../../utils/signal_bus.js";
import "../../utils/types.js"
import { UI_SIGNAL, UISB } from "../core/signals.js";
import { store_get } from "../core/store.js";
import { comp_create_comp } from "./core/comp.js";

const MAX_RENDERED_LOGS = 10;

/**
 * @returns {string}
 */
export function logscomp_render() {
    return `
<h1>Logs</h1>
<ul class="logs-list"></ul>
    `;
}

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function logscomp_mount(container) {
    return comp_create_comp(container, "logs-comp", (el, add_cleanup) => {
        el.innerHTML = logscomp_render();

        const update = () => {
            const s = store_get();
            const list = el.querySelector(".logs-list");
            if (!list) return;
            list.innerHTML = s.ui_state.logs
                .slice(-MAX_RENDERED_LOGS)
                .map(log => `<li>${log}</li>`)
                .join("");
        };

        add_cleanup(signalbus_on(UISB, UI_SIGNAL.LOGS, update));
        // TODO: NE PAS METTRE CAR les components ne doivent pas se toggle eux meme ça se fait dans menu_comp.js
        // const off_toggle = signalbus_on(UISB, "toggle_logs", () => {
        //     el.classList.toggle("hidden");
        // });
        update();
    });
}
