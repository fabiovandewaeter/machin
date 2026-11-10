// utils/random_generator.js

import { assert } from "./assert.js";

/**
 * @typedef {Object} RandomGenerator
 * @prop {number} state
 */

/**
 * @param {number} seed
 * @returns {RandomGenerator}
 */
export function randomgenerator_create(seed) {
    assert(Number.isSafeInteger(seed), `Invalid seed: ${seed}`);
    return { state: seed | 0 };
}

/**
 * @param {unknown} value
 * @returns {value is RandomGenerator}
 */
export function randomgenerator_is_valid(value) {
    if (!value || typeof value !== "object") return false;
    const state = /** @type {RandomGenerator} */ (value).state;
    return Number.isInteger(state) && (state | 0) === state;
}

/**
 * @param {RandomGenerator} generator
 * @returns {number}
 */
export function randomgenerator_next_float(generator) {
    generator.state = (generator.state + 0x6D2B79F5) | 0;
    let value = generator.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

/**
 * @param {RandomGenerator} generator
 * @param {number} max
 * @returns {number}
 */
export function randomgenerator_next_int(generator, max) {
    assert(Number.isSafeInteger(max) && max > 0, `Invalid max: ${max}`);
    return Math.floor(randomgenerator_next_float(generator) * max);
}
