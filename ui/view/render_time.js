// @ts-check
// ui/view/render_time.js

import '../types.js';

/**
 * @param {Model|null} prev
 * @param {Model} next
 */
export function render_time(prev, next) {
    const counter = document.getElementById('time_counter')
    if (!counter) throw new Error();
    if (prev?.world.clock.accumulated_time === next.world.clock.accumulated_time) return;

    counter.textContent = (next.world.clock.accumulated_time / 1000).toString();
}
