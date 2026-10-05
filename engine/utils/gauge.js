// engine/utils/gauge.js
// @ts-check

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
export function create({ max, current = max }) {
    return {
        current,
        max,
    };
}

/**
 * @param {Gauge} gauge
 * @param {number} amount
 */
export function damage(gauge, amount) { gauge.current = Math.max(0, gauge.current - amount); }

/**
 * @param {Gauge} gauge
 * @param {number} amount
 */
export function heal(gauge, amount) { gauge.current = Math.min(gauge.max, gauge.current + amount); }

/**
 * @param {Gauge} gauge
 * @returns {number} ratio 0-1
 */
export function ratio(gauge) {
    return gauge.max === 0 ? 0 : gauge.current / gauge.max;
}
