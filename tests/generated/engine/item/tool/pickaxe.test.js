// tests/generated/engine/item/tool/pickaxe.test.js

import { materialitem_create } from "../../../../../src/engine/item/material/material_item.js";
import { pickaxe_craft, pickaxe_is_valid } from "../../../../../src/engine/item/tool/pickaxe.js";
import { result_unwrap } from "../../../../../src/utils/result.js";
import { assert } from "../../../../shared/assert.js";
import { test } from "../../../../shared/test.js";

test("une pioche dont le niveau ne correspond pas à ses pièces est invalide", () => {
    const pickaxe = result_unwrap(pickaxe_craft({
        parts: {
            ROD: materialitem_create({ kind: "ROD", material: "IRON", quality: "NORMAL" }),
            HEAD: materialitem_create({ kind: "HEAD", material: "IRON", quality: "NORMAL" }),
        },
    }));
    assert(pickaxe_is_valid(pickaxe));
    assert(!pickaxe_is_valid({ ...pickaxe, mining_level: pickaxe.mining_level + 1 }));
});
