// utils/undefined.js

/**
 * Unwrap a possibly undefined value or throw.
 * @template T
 * @param {T | undefined} value
 * @param {string} [msg]
 * @returns {T}
 */
export function undefined_unwrap(value, msg) {
    return undefined_expect(value, msg ?? "Tried to unwrap undefined");
}

/**
 * Unwrap or throw a custom error message if undefined
 * @template T
 * @param {T | undefined} value
 * @param {string} msg
 * @returns {T}
 */
export function undefined_expect(value, msg) {
    if (value !== undefined) return value;
    throw new Error(msg);
}
