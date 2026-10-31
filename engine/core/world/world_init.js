/**
 * @typedef {import("./world.types.js").World} World
 * @typedef {import("../../item/material/material.js").MaterialKind} MaterialKind
 * @typedef {import("../../item/quality.js").Quality} Quality
 */
import { result_unwrap } from "../../../utils/result.js";
import { inventory_add_item } from "../../inventory.js";
import { materialitem_create } from "../../item/material/material_item.js";
import { pickaxe_craft } from "../../item/tool/pickaxe.js";
import { GALAXY_DEFAULT_ROOM_ID, galaxy_init } from "../../map/galaxy.js";
import { enginesignals_batch } from "../signal/signal.js";
import { world_spawn_entity } from "./world.js";

/** @param {World} world */
export function world_init(world) {
    if (world.galaxy.room_repo.elements.length || world.entity_repo.elements.length || world.inventory_repo.elements.length) {
        throw new Error("World is already initialized");
    }
    enginesignals_batch(() => {
        galaxy_init(world.galaxy);
        const robot = world_spawn_entity(world, {
            name: "robot 1",
            room_id: GALAXY_DEFAULT_ROOM_ID,
            tool: __worldinit_create_pickaxe("STONE", "POOR"),
        });
        inventory_add_item(world.inventory_repo, robot.inventory_id, __worldinit_create_pickaxe("IRON", "PERFECT"));
        world_spawn_entity(world, {
            name: "entity 2",
            room_id: GALAXY_DEFAULT_ROOM_ID,
            tool: __worldinit_create_pickaxe("STONE", "POOR"),
        });
    });
}

/**
 * @param {MaterialKind} material
 * @param {Quality} quality
 */
function __worldinit_create_pickaxe(material, quality) {
    return result_unwrap(pickaxe_craft({
        parts: {
            ROD: materialitem_create({ kind: "ROD", material, quality }),
            HEAD: materialitem_create({ kind: "HEAD", material, quality }),
        },
    }));
}
