// tests/fixtures.js

import { clock_create } from "../engine/core/clock.js";
import { world_create, world_spawn_entity } from "../engine/core/world/world.js";
import { ore_create } from "../engine/extraction/ore.js";
import { materialitem_create, materialitem_create_stack } from "../engine/item/material/material_item.js";
import { pickaxe_craft } from "../engine/item/tool/pickaxe.js";
import { room_add_exit, room_spawn } from "../engine/map/room/room.js";
import { result_unwrap } from "../utils/result.js";

export function create_test_world() {
    const world = world_create();
    world.clock = clock_create(0);
    const ore = ore_create({
        internal_id: /** @type {import("../engine/extraction/ore.js").__InternalOreID} */ (0),
        composition: [materialitem_create_stack(materialitem_create({ kind: "ORE", material: "STONE", quality: "NORMAL" }), 2)],
    });
    const source = room_spawn(world.galaxy.room_repo, { kind: "CITY", name: "source", layer: 0, content: [ore] });
    const destination = room_spawn(world.galaxy.room_repo, { kind: "FOREST", name: "destination", layer: 0, content: [] });
    const isolated = room_spawn(world.galaxy.room_repo, { kind: "MOUNTAIN", name: "isolated", layer: 0, content: [] });
    room_add_exit(world.galaxy.room_repo, source.id, "destination", { target_id: destination.id });
    room_add_exit(world.galaxy.room_repo, destination.id, "source", { target_id: source.id });
    const tool = result_unwrap(pickaxe_craft({
        parts: {
            ROD: materialitem_create({ kind: "ROD", material: "STONE", quality: "NORMAL" }),
            HEAD: materialitem_create({ kind: "HEAD", material: "STONE", quality: "NORMAL" }),
        },
    }));
    const entity = world_spawn_entity(world, { name: "robot", room_id: source.id, tool });
    return { world, source, destination, isolated, ore, tool, entity };
}
