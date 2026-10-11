// engine/utils/gauge.js

/**
 * @typedef {Object} Gauge
 * @property {number} current
 * @property {number} max
 * @property {number} max
 */

/**
 * @param {Object} options
 * @param {number} options.max
 * @param {number} [options.current]
 * @returns {Gauge}
 */
export function gauge_create({ max, current = max }) {
    return {
        current,
        max,
    };
}

/**
 * @param {Gauge} gauge
 * @param {number} amount
 */
export function gauge_damage(gauge, amount) { gauge.current = Math.max(0, gauge.current - amount); }

/**
 * @param {Gauge} gauge
 * @param {number} amount
 */
export function gauge_heal(gauge, amount) { gauge.current = Math.min(gauge.max, gauge.current + amount); }

/**
 * @param {Gauge} gauge
 * @returns {number} ratio 0-1
 */
export function gauge_ratio(gauge) {
    return gauge.max === 0 ? 0 : gauge.current / gauge.max;
}
