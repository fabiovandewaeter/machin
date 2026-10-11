// engine/core/clock.js

/**
 * @typedef {Object} Clock
 * @property {number} created_at
 * @property {number} sim_time
 */

// Note : quand on recharge une sauvegarde, runtime.js n'appelle pas clock_create — il récupère l'objet world.clock déjà désérialisé du JSON tel quel, created_at compris. clock_create ne sert que pour une partie neuve.
/**
 * @param {number|null} saved_timestamp
 * @returns {Clock}
 */
export function clock_create(saved_timestamp) {
    // return { last_tick_timestamp: saved_timestamp ?? Date.now(), accumulated_time: 0 };
    const now = saved_timestamp ?? Date.now();
    return { created_at: now, sim_time: now };
}

/**
 * @param {Clock} clock
 * @param {number} ms
 */
export function clock_advance_by(clock, ms) { clock.sim_time += ms; }

/**
 * Temps réel (ms) écoulé depuis la dernière simulation — indique s'il y a
 * du rattrapage à faire.
 * @param {Clock} clock
 * @returns {number}
 */
export function clock_real_time_elapsed_since(clock) {
    return Date.now() - clock.sim_time;
}

/**
 * @param {Clock} clock
 * @returns {number} temps simulé écoulé depuis la création du monde, en ms
 */
export function clock_get_elapsed_ms(clock) { return clock.sim_time - clock.created_at; }
