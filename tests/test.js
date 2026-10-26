// tests/test.js

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
