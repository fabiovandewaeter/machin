// tests/engine/item/material/durability.js
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

test("descrease_durability(): retire BASE_COST de durability quand meme mining_level", () => {
    const SAME_MATERIAL = "STONE";
    const pickaxe_res = Pickaxe.craft({
        parts: {
            ROD: MaterialItem.create({
                kind: "ROD",
                material: SAME_MATERIAL,
                quality: "POOR"
            }),
            HEAD: MaterialItem.create({
                kind: "HEAD",
                material: SAME_MATERIAL,
                quality: "POOR"
            }),
        }
    });
    const pickaxe = Res.unwrap(pickaxe_res);

    assert_equal(pickaxe.parts.HEAD.durability, Durability.BASE_DURABILITY);
    assert_equal(pickaxe.parts.ROD.durability, Durability.BASE_DURABILITY);

    Durability.decrease_durability([pickaxe.parts.HEAD, pickaxe.parts.ROD], SAME_MATERIAL);

    assert_equal(pickaxe.parts.HEAD.durability, Durability.BASE_DURABILITY - Durability.BASE_COST);
    assert_equal(pickaxe.parts.ROD.durability, Durability.BASE_DURABILITY - Durability.BASE_COST);
});

test("descrease_durability(): retire BASE_COST * diff de mining_level de durability", () => {
    const PARTS_MATERIAL = "STONE";
    const TARGET_MATERIAL = "IRON";
    const pickaxe_res = Pickaxe.craft({
        parts: {
            ROD: MaterialItem.create({
                kind: "ROD",
                material: PARTS_MATERIAL,
                quality: "POOR"
            }),
            HEAD: MaterialItem.create({
                kind: "HEAD",
                material: PARTS_MATERIAL,
                quality: "POOR"
            }),
        }
    });
    const pickaxe = Res.unwrap(pickaxe_res);

    assert_equal(pickaxe.parts.HEAD.durability, Durability.BASE_DURABILITY);
    assert_equal(pickaxe.parts.ROD.durability, Durability.BASE_DURABILITY);

    Durability.decrease_durability([pickaxe.parts.HEAD, pickaxe.parts.ROD], TARGET_MATERIAL);
    const diff = Material.MATERIAL[PARTS_MATERIAL].mining_level - Material.MATERIAL[TARGET_MATERIAL].mining_level;
    assert(diff >= 1);
    const diff_cost_multiplier = diff + 1;

    assert_equal(pickaxe.parts.HEAD.durability, Durability.BASE_DURABILITY - (Durability.BASE_COST * diff_cost_multiplier));
    assert_equal(pickaxe.parts.ROD.durability, Durability.BASE_DURABILITY - (Durability.BASE_COST * diff_cost_multiplier));
});
