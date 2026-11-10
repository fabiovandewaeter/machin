// tests/generated/engine/map/hazard.test.js

import { hazard_create } from "../../../../src/engine/map/hazard.js";
import { assert_equal, assert_throws } from "../../../shared/assert.js";
import { test } from "../../../shared/test.js";

test("hazard_create refuse une intensité hors de [0, 1] ou NaN", () => {
    for (const intensity of [-0.1, 1.1, NaN]) {
        assert_throws(() => hazard_create({ kind: "RADIATION", intensity }), Error, "between 0 and 1");
    }
    assert_equal(hazard_create({ kind: "RADIATION", intensity: 1 }).intensity, 1);
});
