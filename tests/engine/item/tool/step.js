// tests/engine/item/tool/step.js
// @ts-check

/**
 * @typedef {import("../../../../engine/item/material/material_item.js").MaterialItem} MaterialItem
 */
import { assert, assert_equal, test } from "../../../test.js";
import * as Pickaxe from "../../../../engine/item/tool/pickaxe.js";
import * as Res from "../../../../utils/result.js";
import * as MaterialItem from "../../../../engine/item/material/material_item.js";
import * as Material from "../../../../engine/item/material/material.js";
import * as Durability from "../../../../engine/item/material/durability.js";
import * as Step from "../../../../engine/item/tool/step.js";

test("how_many_steps(): retourne BASE_STEP_AMOUNT quand meme mining_level", () => {
    const SAME_MATERIAL = "STONE";
    const head = MaterialItem.create({
        kind: "HEAD",
        material: SAME_MATERIAL,
        quality: "POOR"
    });

    const step_amount = Step.how_many_steps(head, SAME_MATERIAL);

    assert_equal(step_amount, Step.BASE_STEP_AMOUNT);
});

test("how_many_steps(): retourne BASE_STEP_AMOUNT - (diff_mining_level)", () => {
    const HEAD_MATERIAL = "STONE";
    const TARGET_MATERIAL = "IRON";
    const head = MaterialItem.create({
        kind: "HEAD",
        material: HEAD_MATERIAL,
        quality: "POOR"
    });

    const step_amount = Step.how_many_steps(head, TARGET_MATERIAL);
    const diff = Material.MATERIAL[HEAD_MATERIAL].mining_level - Material.MATERIAL[TARGET_MATERIAL].mining_level;
    assert(diff >= 1);

    assert_equal(step_amount, Step.BASE_STEP_AMOUNT - (diff));
});
