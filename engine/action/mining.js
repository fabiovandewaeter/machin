// engine/action/mining.js

import { repository_get } from "../../utils/repository.js";
import { err, ok } from "../../utils/result.js";
import { undefined_unwrap } from "../../utils/undefined.js";
import { inventory_add_item } from "../inventory.js";

/**
 * @typedef {import("../extraction/ore").Ore} Ore
 * @typedef {import("../item/tool/tool.js").Tool} Tool
 * @typedef {import("../item/material/material_item.js").MaterialItemStack} MaterialItemStack
 * @typedef {import("./action").ActionKind} ActionKind
 * @typedef {import("../core/ids.types.js").EntityID} EntityID
 * @typedef {import("../entity/entity.types.js").EntityRepo} EntityRepo
 * @typedef {import("../inventory.js").InventoryRepo} InventoryRepo
 */
/** @template T, E @typedef {import("../../utils/result.js").Res<T, E>} Res */

/** @type {ActionKind} */
const __ACTION_KIND = "MINING";

/**
 * @param {Ore} ore 
 * @param {Tool} tool 
 * @param {EntityRepo} entity_repo
 * @param {EntityID} entity_id
 * @param {InventoryRepo} inventory_repo
 * @returns {Res<MaterialItemStack[], string>}
 */
export function mining_mine(ore, tool, entity_repo, entity_id, inventory_repo) {
    if (!tool.compatible_actions.includes(__ACTION_KIND)) {
        return err(`Tool incompatible: ${tool.kind} ${__ACTION_KIND}`);
    }

    const entity = undefined_unwrap(repository_get(entity_repo, entity_id));

    for (const material_item_stack of ore.composition) {
        const amount = material_item_stack.amount;
        for (let i = 0; i < amount; i++) {
            inventory_add_item(inventory_repo, entity.inventory_id, material_item_stack.material_item);
        }
    }

    return ok(ore.composition);
}
