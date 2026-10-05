// tests/engine/item/tool/pickaxe.js
// @ts-check

/**
 * @typedef {import("../../../../engine/item/material/material_item.js").MaterialItem} MaterialItem
 */
import { assert, test } from "../../../test.js";
import * as Pickaxe from "../../../../engine/item/tool/pickaxe.js";
import * as MaterialItem from "../../../../engine/item/material/material_item.js";
import * as Res from "../../../../utils/result.js";

test("craft(): craft bon", () => {
    const parts = {
        ROD: MaterialItem.create({
            kind: "ROD",
            material: "STONE",
            quality: "POOR"
        }),
        HEAD: MaterialItem.create({
            kind: "HEAD",
            material: "STONE",
            quality: "POOR"
        }),
    }

    const pickaxe_res = Pickaxe.craft({
        parts
    });
    Res.assert_ok(pickaxe_res);
});

test("craft(): craft impossible car Material differents", () => {
    const parts = {
        ROD: MaterialItem.create({
            kind: "ROD",
            material: "STONE",
            quality: "POOR"
        }),
        HEAD: MaterialItem.create({
            kind: "HEAD",
            material: "IRON",
            quality: "POOR"
        }),
    }

    const pickaxe_res = Pickaxe.craft({ parts });
    assert(Res.is_err(pickaxe_res));
});
