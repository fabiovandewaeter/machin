// ui/core/component/time_comp.js
// @ts-check

/**
 * @typedef {import("./core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../core/store.js").GameStore} GameStore
 */
import "../../utils/types.js"
import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_WEEK, SECONDS_PER_YEAR } from "../../utils/const.js";
import * as UISB from "../core/signals.js";
import * as SB from "../../utils/signal_bus.js";
import * as Store from "../core/store.js";
import * as Clock from "../../engine/core/clock.js";
import * as Comp from "./core/comp.js";
import * as ESB from "../../engine/core/signals.js";

/**
 * @returns {string}
 */
export function render() {
    return `
<h1>Temps passé: </h1>
<span class="time-seconds">0</span> secondes
<span class="time-minutes">0</span> minutes
<span class="time-hours">0</span> heures
<span class="time-days">0</span> jours
<span class="time-weeks">0</span> semaines
<span class="time-years">0</span> années
    `;
}

/**
 * @param {GameStore} store
 * @returns {number} temps simulé écoulé depuis la création du monde, en ms
 */
function get_accumulated_seconds(store) { return Clock.get_elapsed_ms(store.world.clock) / 1000; }

/**
 * @param {HTMLElement} el
 */
export function update(el) {
    let s = Store.get();
    const accumulated_seconds = get_accumulated_seconds(s);

    const s_counter = el.querySelector(".time-seconds");
    const m_counter = el.querySelector(".time-minutes");
    const h_counter = el.querySelector(".time-hours");
    const d_counter = el.querySelector(".time-days");
    const w_counter = el.querySelector(".time-weeks");
    const y_counter = el.querySelector(".time-years");

    if (!s_counter || !m_counter || !h_counter || !d_counter || !w_counter || !y_counter) throw new Error();

    s_counter.textContent = Math.floor(accumulated_seconds).toString();
    m_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_MINUTE).toString();
    h_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_HOUR).toString();
    d_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_DAY).toString();
    w_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_WEEK).toString();
    y_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_YEAR).toString();
}

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function mount(container) {
    return Comp.create_comp(container, "time-comp", (el, add_cleanup) => {
        el.innerHTML = render();

        add_cleanup(SB.on(ESB.BUS, ESB.SIGNAL.ENTITY_BROKE, (payload) => update(el)));
        update(el);
    });
}
