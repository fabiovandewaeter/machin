// engine/core/clock.js

/**
 * @typedef {Object} Clock
 * @property {number} created_at
 * @property {number} sim_time
 */

/**
 * @param {number} [timestamp]
 * @returns {Clock}
 */
export function clock_create(timestamp = Date.now()) {
    if (!Number.isFinite(timestamp) || timestamp < 0) throw new RangeError("Invalid clock timestamp");
    return { created_at: timestamp, sim_time: timestamp };
}

/**
 * @param {Clock} clock
 * @param {number} ms
 */
export function clock_advance_by(clock, ms) {
    const target_time = clock.sim_time + ms;
    if (!Number.isFinite(ms) || ms < 0 || !Number.isFinite(target_time)) throw new RangeError("Invalid clock advance");
    clock.sim_time = target_time;
}

/**
 * Temps réel (ms) écoulé depuis la dernière simulation — indique s'il y a
 * du rattrapage à faire.
 * @param {Clock} clock
 * @returns {number}
 */
export function clock_real_time_elapsed_since(clock) {
    return Math.max(0, Date.now() - clock.sim_time);
}

/**
 * @param {Clock} clock
 * @returns {number} temps simulé écoulé depuis la création du monde, en ms
 */
export function clock_get_elapsed_ms(clock) { return clock.sim_time - clock.created_at; }
