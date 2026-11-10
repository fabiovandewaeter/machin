// engine/entity/stat.js

import { gauge_create } from "../utils/gauge.js";

/**
 * @typedef {import("../utils/gauge.js").Gauge} Gauge
 */


/**
 * @typedef { Object } GaugeStat
 * @prop { "HP" | "ENERGY" } key
 * @prop { Gauge } gauge
 * 
 * @typedef {Object} ValueStat
 * @prop {"DEFENSE"} key
 * @prop {number} value
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
