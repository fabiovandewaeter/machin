// tests/shared/test.js

import { enginesignals_clear_handlers } from "../../src/engine/core/signal/signal.js";
import { timeline_clear_handlers } from "../../src/engine/core/timeline/timeline.js";
import { uisignals_clear_handlers } from "../../src/ui/core/signal/signal.js";
import { assert } from "./assert.js";

/** @type {{ name: string, passed: boolean }[]} */
const __TEST_RESULTS = [];

/**
 * @param {string} name
 * @param {() => void} fn
 */
export function test(name, fn) {
    enginesignals_clear_handlers();
    uisignals_clear_handlers();
    timeline_clear_handlers();
    try {
        const result = /** @type {unknown} */ (fn());
        assert(result === undefined, "A test must be synchronous and return nothing");
        __TEST_RESULTS.push({ name, passed: true });
        console.log(`✅ ${name}`);
    } catch (error) {
        __TEST_RESULTS.push({ name, passed: false });
        console.error(`❌ ${name}`);
        console.error(error);
    }
}

export function test_report() {
    const failed_names = __TEST_RESULTS.filter(result => !result.passed).map(result => result.name);
    const summary = `${__TEST_RESULTS.length - failed_names.length}/${__TEST_RESULTS.length} tests réussis`;
    const lines = [`${failed_names.length ? "❌" : "✅"} ${summary}`, ...failed_names.map(name => `❌ ${name}`)];
    if (failed_names.length) console.error(lines.join("\n"));
    else console.log(lines.join("\n"));
    const report = document.getElementById("test-report");
    assert(report, "Missing test report element");
    report.textContent = lines.join("\n");
}
