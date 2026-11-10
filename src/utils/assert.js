// utils/assert.js

/**
 * @param {unknown} condition
 * @param {string} [message]
 * @returns {asserts condition}
 */
export function assert(condition, message = "Assertion failed") {
    if (!condition) {
        throw new Error(message);
    }
}
