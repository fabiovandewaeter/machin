// tests/generated/engine/item/material/durability.test.js

import { durability_decrease_durability } from "../../../../../src/engine/item/material/durability.js";
import { materialitem_create } from "../../../../../src/engine/item/material/material_item.js";
import { assert_equal, assert_throws } from "../../../../shared/assert.js";
import { test } from "../../../../shared/test.js";

test("la durabilité ne descend pas sous zéro", () => {
    const head = materialitem_create({ kind: "HEAD", material: "STONE", quality: "POOR" });
    head.durability = 1;
    durability_decrease_durability([head], "STONE");
    assert_equal(head.durability, 0);
});

test("aucune pièce n'est usée si une autre ne peut pas miner la cible", () => {
    const iron = materialitem_create({ kind: "HEAD", material: "IRON", quality: "POOR" });
    const stone = materialitem_create({ kind: "ROD", material: "STONE", quality: "POOR" });
    const durability = iron.durability;
    assert_throws(() => durability_decrease_durability([iron, stone], "IRON"), Error, "Cannot mine");
    assert_equal(iron.durability, durability);
});
