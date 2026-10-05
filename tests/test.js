// tests/test.js
// @ts-check


/**
 * Run a test
 *
 * @param {string} name
 * @param {() => void} fn
 */
export function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(error);
    }
}

/**
 * Assert that a condition is true
 *
 * @param {boolean} condition
 * @param {string} [message]
 * @throws {Error}
 */
export function assert(condition, message = "Assertion failed") {
    if (!condition) {
        throw new Error(message);
    }
}

/**
 * Assert that two values are strictly equal
 *
 * @template T
 * @param {T} actual
 * @param {T} expected
 * @param {string} [message]
 * @throws {Error}
 */
export function assert_equal(actual, expected, message = "Values are not equal") {
    if (actual !== expected) {
        throw new Error(
            `${message}\nExpected: ${expected}\nActual: ${actual}`
        );
    }
}
