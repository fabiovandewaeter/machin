// engine/entity/stat.js
// @ts-check

/**
 * @typedef {import("../utils/gauge.js").Gauge} Gauge
 */
import * as Gauge from "../utils/gauge.js";

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
export function HP(max) {
    return { key: "HP", gauge: Gauge.create({ max }) };
}
/**
 * @param {number} max
 * @returns {GaugeStat}
 */
export function ENERGY(max) {
    return { key: "ENERGY", gauge: Gauge.create({ max }) };
}
/**
 * @param {number} amount
 * @returns {ValueStat}
 */
export function DEFENSE(amount) {
    return { key: "DEFENSE", value: amount };
}
