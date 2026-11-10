// tests/generated/engine/action/mining.test.js

import { mining_can_mine } from "../../../../src/engine/action/mining.js";
import { assert } from "../../../shared/assert.js";
import { create_test_world } from "../../../shared/fixtures.js";
import { test } from "../../../shared/test.js";

test("le minage exige un outil compatible et de niveau suffisant", () => {
    const { ore, tool } = create_test_world();
    assert(mining_can_mine(ore, tool));
    assert(!mining_can_mine(ore, undefined));
    assert(!mining_can_mine({ ...ore, required_mining_level: tool.mining_level + 1 }, tool));
    assert(!mining_can_mine(ore, { ...tool, compatible_actions: [] }));
});
