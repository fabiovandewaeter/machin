// engine/gas.js
// @ts-check

/**
 * @typedef {Object} GasDefinition
 * @property {string} kind
 * @property {string} formula
 * @property {number} molar_mass g/mol
 */

/** @satisfies {Record<string, GasDefinition>} */
export const GAS = Object.freeze(/**@type {const}*/({
    OXYGEN: { kind: "OXYGEN", molar_mass:  },
}));
/**
 * @typedef {EnumKey<typeof GAS>} Gas
 */
