// engine/item/tool/step.js
// @ts-check

/**
 * @typedef {import("../material/material_item").MaterialItem} MaterialItem
 * @typedef {import("../material/material").Material} Material
 */
import { assert } from "../../../tests/test.js";
import * as Material from "../material/material.js";

export const BASE_STEP_AMOUNT = 3;
export const MIN_STEP_AMOUNT = 1;

/**
 * @param {MaterialItem & {kind: "HEAD"}} head
 * @param {Material} target
 * @throws {Error} si la target est impossible à miner
 */
export function how_many_steps(head, target) {
    const target_material = Material.MATERIAL[target];

    const head_material = Material.MATERIAL[head.material];
    const diff = head_material.mining_level - target_material.mining_level;
    assert(diff >= 0);
    const step_amount = Math.max(BASE_STEP_AMOUNT - diff, MIN_STEP_AMOUNT);

    return step_amount;
}
