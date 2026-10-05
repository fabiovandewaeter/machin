// utils/utils.js
// @ts-check

/**
 * pour convertir un string en number ou TID par exemple
 * PAS de verification au runtime sur le type, juste sur la conversion string to int
 * @template {number} RType
 * @param {string|undefined} id_string
 * @returns {RType}
 */
export function string_to_rkind(id_string) {
    if (!id_string) throw new Error();
    const id = Number(id_string);
    if (!Number.isSafeInteger(id) || id < 0) throw new Error;
    return  /**@type {RType}*/(id);
}

/**
 * @param {object} data
 */
export function data_key(data) { return JSON.stringify(data, Object.keys(data).sort()); }

/**
 * @param {never} value
 * @returns {never}
 */
export function assert_unreachable(value) { throw new Error(`Unexpected value: ${String(value)}`); }
