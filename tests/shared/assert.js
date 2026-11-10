// tests/shared/assert.js

export { assert } from "../../src/utils/assert.js";

/**
 * @template T
 * @param {T} actual
 * @param {T} expected
 * @param {string} [message]
 */
export function assert_equal(actual, expected, message = "Values are not equal") {
    if (actual !== expected) {
        throw new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
    }
}

/**
 * @template {Error} E
 * @param {() => unknown} operation
 * @param {new (...args: any[]) => E} error_class
 * @param {string} [message_part]
 * @returns {E}
 */
export function assert_throws(operation, error_class, message_part) {
    try {
        operation();
    } catch (error) {
        if (!(error instanceof error_class) || error.constructor !== error_class) {
            throw new Error(`Expected ${error_class.name}, got: ${error}`);
        }
        if (message_part !== undefined && !error.message.includes(message_part)) {
            throw new Error(`Expected message containing "${message_part}", got: "${error.message}"`);
        }
        return error;
    }
    throw new Error(`Expected ${error_class.name} to be thrown`);
}
