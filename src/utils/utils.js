// utils/utils.js

import { assert } from "./assert.js";

/**
 * pour convertir un string en number ou TID par exemple
 * PAS de verification au runtime sur le type, juste sur la conversion string to int
 * @template {number} RType
 * @param {string|undefined} id_string
 * @returns {RType}
 */
export function utils_string_to_rkind(id_string) {
    assert(id_string, "Missing ID string");
    const id = Number(id_string);
    assert(Number.isSafeInteger(id) && id >= 0, `Invalid ID: ${id_string}`);
    return  /**@type {RType}*/(id);
}

/**
 * @param {unknown} data
 * @returns {string|undefined}
 */
export function utils_data_key(data) {
    return JSON.stringify(data, (_key, value) => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return value;
        /** @type {Record<string, unknown>} */
        const sorted = {};
        for (const key of Object.keys(value).sort()) sorted[key] = value[key];
        return sorted;
    });
}

/**
 * @param {never} value
 * @returns {never}
 */
export function utils_assert_unreachable(value) { throw new Error(`Unexpected value: ${String(value)}`); }
