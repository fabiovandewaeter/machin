// tests/manual/engine/item/material/durability.test.js

/**
 * @typedef {import("../../../../../src/engine/item/material/material_item.js").MaterialItem} MaterialItem
 */
import { durability_decrease_durability } from "../../../../../src/engine/item/material/durability.js";
import { BASE_DURABILITY, BASE_COST } from "../../../../../src/engine/item/material/durability.types.js";
import { MATERIAL } from "../../../../../src/engine/item/material/material.js";
import { materialitem_create } from "../../../../../src/engine/item/material/material_item.js";
import { pickaxe_craft } from "../../../../../src/engine/item/tool/pickaxe.js";
import { result_unwrap } from "../../../../../src/utils/result.js";
import { assert, assert_equal } from "../../../../shared/assert.js";
import { test } from "../../../../shared/test.js";

test("descrease_durability(): retire BASE_COST de durability quand meme mining_level", () => {
    const SAME_MATERIAL = "STONE";
    const pickaxe_res = pickaxe_craft({
        parts: {
            ROD: materialitem_create({
                kind: "ROD",
                material: SAME_MATERIAL,
                quality: "POOR"
            }),
            HEAD: materialitem_create({
                kind: "HEAD",
                material: SAME_MATERIAL,
                quality: "POOR"
            }),
        }
    });
    const pickaxe = result_unwrap(pickaxe_res);

    assert_equal(pickaxe.parts.HEAD.durability, BASE_DURABILITY);
    assert_equal(pickaxe.parts.ROD.durability, BASE_DURABILITY);

    durability_decrease_durability([pickaxe.parts.HEAD, pickaxe.parts.ROD], SAME_MATERIAL);

    assert_equal(pickaxe.parts.HEAD.durability, BASE_DURABILITY - BASE_COST);
    assert_equal(pickaxe.parts.ROD.durability, BASE_DURABILITY - BASE_COST);
});

test("descrease_durability(): réduit le coût quand le matériau est plus résistant", () => {
    const PARTS_MATERIAL = "IRON";
    const TARGET_MATERIAL = "STONE";
    const pickaxe_res = pickaxe_craft({
        parts: {
            ROD: materialitem_create({
                kind: "ROD",
                material: PARTS_MATERIAL,
                quality: "POOR"
            }),
            HEAD: materialitem_create({
                kind: "HEAD",
                material: PARTS_MATERIAL,
                quality: "POOR"
            }),
        }
    });
    const pickaxe = result_unwrap(pickaxe_res);

    assert_equal(pickaxe.parts.HEAD.durability, BASE_DURABILITY);
    assert_equal(pickaxe.parts.ROD.durability, BASE_DURABILITY);

    durability_decrease_durability([pickaxe.parts.HEAD, pickaxe.parts.ROD], TARGET_MATERIAL);
    const diff = MATERIAL[PARTS_MATERIAL].mining_level - MATERIAL[TARGET_MATERIAL].mining_level;
    assert(diff >= 1);
    const diff_cost_multiplier = diff + 1;

    assert_equal(pickaxe.parts.HEAD.durability, BASE_DURABILITY - (BASE_COST / diff_cost_multiplier));
    assert_equal(pickaxe.parts.ROD.durability, BASE_DURABILITY - (BASE_COST / diff_cost_multiplier));
});
