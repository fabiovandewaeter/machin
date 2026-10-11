// tests/engine/item/tool/pickaxe.js

/**
 * @typedef {import("../../../../engine/item/material/material_item.js").MaterialItem} MaterialItem
 */
import { materialitem_create } from "../../../../engine/item/material/material_item.js";
import { pickaxe_craft } from "../../../../engine/item/tool/pickaxe.js";
import { result_assert_ok, result_is_err } from "../../../../utils/result.js";
import { assert, test } from "../../../test.js";

test("craft(): craft bon", () => {
    const parts = {
        ROD: materialitem_create({
            kind: "ROD",
            material: "STONE",
            quality: "POOR"
        }),
        HEAD: materialitem_create({
            kind: "HEAD",
            material: "STONE",
            quality: "POOR"
        }),
    }

    const pickaxe_res = pickaxe_craft({
        parts
    });
    result_assert_ok(pickaxe_res);
});

test("craft(): craft impossible car Material differents", () => {
    const parts = {
        ROD: materialitem_create({
            kind: "ROD",
            material: "STONE",
            quality: "POOR"
        }),
        HEAD: materialitem_create({
            kind: "HEAD",
            material: "IRON",
            quality: "POOR"
        }),
    }

    const pickaxe_res = pickaxe_craft({ parts });
    assert(result_is_err(pickaxe_res));
});
