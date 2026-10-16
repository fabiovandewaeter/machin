// engine/gas.js

/** @template {Record<string, unknown>} T @typedef {import("../utils/enum.js").EnumKey<T>} EnumKey */

/**
 * @typedef {Object} GasDefinition
 * @property {string} kind
 * @property {string} formula
 * @property {number} molar_mass g/mol
 */

// TODO:
// /** @satisfies {Record<string, GasDefinition>} */
// export const GAS = Object.freeze(/**@type {const}*/({
//     OXYGEN: { kind: "OXYGEN", molar_mass:  },
// }));
// /**
//  * @typedef {EnumKey<typeof GAS>} Gas
//  */
