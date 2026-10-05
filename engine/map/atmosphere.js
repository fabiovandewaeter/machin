// engine/map/atmosphere.js
// @ts-check

/**
 * @typedef {import("../item/material/material.js").Gas} Gas
 * @typedef {import("../utils/core/composition.js").Composition<Gas>} GasComposition
 */
const R = 8.314;

TODO: faire un template au moment de la génération et le stocker comme ça quand on seal puis unseal on peut faire tendre vers cette valeur

/**
 * @typedef {Object} Atmosphere
 * @property {Record<Gas, number>} amounts moles
 * @property {number} volume m³
 * @property {number} temperature K
 */

/**
 * @param {Atmosphere} atmosphere 
 * @returns {number}
 */
export function get_pressure(atmosphere) {

}
