// tests/manual/engine/item/tool/step.test.js

/**
 * @typedef {import("../../../../../src/engine/item/material/material_item.js").MaterialItem} MaterialItem
 */
import { MATERIAL } from "../../../../../src/engine/item/material/material.js";
import { materialitem_create } from "../../../../../src/engine/item/material/material_item.js";
import { step_how_many_steps, BASE_STEP_AMOUNT } from "../../../../../src/engine/item/tool/step.js";
import { assert, assert_equal } from "../../../../shared/assert.js";
import { test } from "../../../../shared/test.js";

test("how_many_steps(): retourne BASE_STEP_AMOUNT quand meme mining_level", () => {
    const SAME_MATERIAL = "STONE";
    const head = materialitem_create({
        kind: "HEAD",
        material: SAME_MATERIAL,
        quality: "POOR"
    });

    const step_amount = step_how_many_steps(head, SAME_MATERIAL);

    assert_equal(step_amount, BASE_STEP_AMOUNT);
});

test("how_many_steps(): retourne BASE_STEP_AMOUNT - (diff_mining_level)", () => {
    const HEAD_MATERIAL = "IRON";
    const TARGET_MATERIAL = "STONE";
    const head = materialitem_create({
        kind: "HEAD",
        material: HEAD_MATERIAL,
        quality: "POOR"
    });

    const step_amount = step_how_many_steps(head, TARGET_MATERIAL);
    const diff = MATERIAL[HEAD_MATERIAL].mining_level - MATERIAL[TARGET_MATERIAL].mining_level;
    assert(diff >= 1);

    assert_equal(step_amount, BASE_STEP_AMOUNT - (diff));
});
