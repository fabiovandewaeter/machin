import { compatibility_are_material_items_and_parts_compatibles } from "../../../engine/item/compatibility.js";
import { materialitem_create } from "../../../engine/item/material/material_item.js";
import { assert_equal } from "../../../utils/assert.js";
import { result_assert_err, result_assert_ok } from "../../../utils/result.js";
import { test } from "../../test.js";

test("la validation des pièces compare les kinds sans trier les tableaux d'entrée", () => {
    const items = [
        materialitem_create({ kind: "ROD", material: "STONE", quality: "NORMAL" }),
        materialitem_create({ kind: "HEAD", material: "STONE", quality: "NORMAL" }),
    ];
    /** @type {import("../../../engine/item/material/material_item.js").MaterialItemKind[]} */
    const parts = ["ROD", "HEAD"];
    result_assert_ok(compatibility_are_material_items_and_parts_compatibles(items, parts));
    assert_equal(items.map(item => item.kind).join(","), "ROD,HEAD");
    assert_equal(parts.join(","), "ROD,HEAD");
});

test("la validation des pièces refuse les doublons qui remplacent une pièce requise", () => {
    const items = [
        materialitem_create({ kind: "ROD", material: "STONE", quality: "NORMAL" }),
        materialitem_create({ kind: "ROD", material: "STONE", quality: "NORMAL" }),
    ];
    result_assert_err(compatibility_are_material_items_and_parts_compatibles(items, ["ROD", "HEAD"]));
});
