// tests/generated/engine/inventory/inventory.test.js

import { inventory_add_stack } from "../../../../src/engine/inventory/inventory.js";
import { materialitem_create } from "../../../../src/engine/item/material/material_item.js";
import { assert_equal, assert_throws } from "../../../shared/assert.js";
import { create_test_world } from "../../../shared/fixtures.js";
import { test } from "../../../shared/test.js";

test("un stack de quantité invalide est refusé sans mutation", () => {
    const { world, entity } = create_test_world();
    const item = materialitem_create({ kind: "ORE", material: "STONE", quality: "NORMAL" });
    const before = JSON.stringify(world);
    for (const amount of [0, -1, 1.5, NaN]) {
        assert_throws(() => inventory_add_stack(world.inventory_repo, entity.inventory_id, item, amount), Error, "Invalid item amount");
    }
    assert_equal(JSON.stringify(world), before);
});
