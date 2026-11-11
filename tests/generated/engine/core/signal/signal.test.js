// tests/generated/engine/core/signal/signal.test.js

import { enginesignal_emit, enginesignal_on, enginesignals_batch, enginesignals_clear_handlers } from "../../../../../src/engine/core/signal/signal.js";
import { assert_equal } from "../../../../shared/assert.js";
import { test } from "../../../../shared/test.js";

test("le bus moteur relaie abonnements et batches, et l'effacement retire les handlers", () => {
    let calls = 0;
    enginesignal_on("TICK", () => calls++);
    enginesignals_batch(() => {
        enginesignal_emit("TICK");
        assert_equal(calls, 0);
    });
    assert_equal(calls, 1);
    enginesignals_clear_handlers();
    enginesignal_emit("TICK");
    assert_equal(calls, 1);
});
