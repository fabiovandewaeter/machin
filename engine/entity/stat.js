// engine/entity/stat.js
// @ts-check

import { gauge_create } from "../utils/gauge.js";

/**
 * @typedef {import("../utils/gauge.js").Gauge} Gauge
 */


/**
 * @typedef { Object } GaugeStat
 * @property { "HP" | "ENERGY" } key
 * @property { Gauge } gauge
 * 
 * @typedef {Object} ValueStat
 * @property {"DEFENSE"} key
 * @property {number} value
 * 
 * @typedef {GaugeStat | ValueStat} Stat
 */

/**
 * @param {number} max
 * @returns {GaugeStat}
 */
export function stat_HP(max) {
    return { key: "HP", gauge: gauge_create({ max }) };
}
/**
 * @param {number} max
 * @returns {GaugeStat}
 */
export function stat_ENERGY(max) {
    return { key: "ENERGY", gauge: gauge_create({ max }) };
}
/**
 * @param {number} amount
 * @returns {ValueStat}
 */
export function stat_DEFENSE(amount) {
    return { key: "DEFENSE", value: amount };
}
