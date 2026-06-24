// ui/views/time_view.js
// @ts-check

import '../../utils/types.js'
import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_WEEK, SECONDS_PER_YEAR } from '../../utils/const.js'

/**
 * @returns {string}
 */
export function render() {
    return `
    <div class="time-view">
        <h1>Temps passé: </h1>
        <span class="time-seconds">0</span> secondes
        <span class="time-minutes">0</span> minutes
        <span class="time-hours">0</span> heures
        <span class="time-days">0</span> jours
        <span class="time-weeks">0</span> semaines
        <span class="time-years">0</span> années
    </div>
    `;
}

/**
 * @param {D<Model>|null} prev
 * @param {D<Model>} next
 */
export function update_all(prev, next) {
    if (prev?.world.clock.accumulated_time === next.world.clock.accumulated_time) return;

    const accumulated_seconds = next.world.clock.accumulated_time / 1000;
    document.querySelectorAll('.time-view').forEach(
        time => {
            const s_counter = time.querySelector('.time-seconds');
            const m_counter = time.querySelector('.time-minutes');
            const h_counter = time.querySelector('.time-hours');
            const d_counter = time.querySelector('.time-days');
            const w_counter = time.querySelector('.time-weeks');
            const y_counter = time.querySelector('.time-years');

            if (!s_counter || !m_counter || !h_counter || !d_counter || !w_counter || !y_counter) throw new Error();

            s_counter.textContent = Math.floor(accumulated_seconds).toString();
            m_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_MINUTE).toString();
            h_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_HOUR).toString();
            d_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_DAY).toString();
            w_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_WEEK).toString();
            y_counter.textContent = Math.floor(accumulated_seconds / SECONDS_PER_YEAR).toString();
        }
    );
}
