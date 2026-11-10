// tests/generated/engine/utils/gauge.test.js

import { gauge_create, gauge_damage, gauge_heal } from "../../../../src/engine/utils/gauge.js";
import { assert_equal, assert_throws } from "../../../shared/assert.js";
import { test } from "../../../shared/test.js";

test("les jauges refusent les montants négatifs ou non finis", () => {
    const gauge = gauge_create({ max: 10, current: 5 });
    assert_throws(() => gauge_damage(gauge, -1), Error, "Invalid damage");
    assert_throws(() => gauge_heal(gauge, NaN), Error, "Invalid heal");
    assert_equal(gauge.current, 5);
    gauge_damage(gauge, 20);
    assert_equal(gauge.current, 0);
    gauge_heal(gauge, 20);
    assert_equal(gauge.current, 10);
});
