// engine/core/world/world_restore.js

/** @typedef {import("./world.types.js").World} World */
import { assert } from "../../../utils/assert.js";
import { repository_get, repository_reindex } from "../../../utils/repository.js";
import { ore_create } from "../../extraction/ore.js";
import { item_is_valid, materialitem_is_valid } from "../../item/item.js";
import { ROOM_KIND } from "../../map/room/room.types.js";
import { timelinescheduler_rebuild_heap } from "../timeline/scheduler.js";

/**
 * @param {unknown} value
 * @returns {World}
 */
export function world_restore(value) {
    assert(!!value && typeof value === "object", "Invalid world");
    const world = /** @type {World} */ (value);
    assert(!!world.clock && Number.isFinite(world.clock.created_at) && world.clock.created_at >= 0
        && Number.isFinite(world.clock.sim_time) && world.clock.sim_time >= world.clock.created_at, "Invalid clock");
    const galaxy = world.galaxy;
    assert(!!galaxy && Array.isArray(galaxy.star_systems), "Invalid galaxy");
    repository_reindex(galaxy.star_system_repo);
    repository_reindex(galaxy.celestial_body_repo);
    repository_reindex(galaxy.region_repo);
    repository_reindex(galaxy.area_repo);
    repository_reindex(galaxy.room_repo);
    repository_reindex(world.entity_repo);
    repository_reindex(world.inventory_repo);
    assert(!!world.timeline_scheduler, "Invalid timeline scheduler");
    repository_reindex(world.timeline_scheduler.repo);

    assert(galaxy.star_systems.every(id => repository_get(galaxy.star_system_repo, id) !== undefined), "Unknown star system");
    for (const system of galaxy.star_system_repo.elements) {
        assert(typeof system.name === "string" && Array.isArray(system.celestial_bodies)
            && system.celestial_bodies.every(id => repository_get(galaxy.celestial_body_repo, id) !== undefined), "Invalid star system");
    }
    for (const body of galaxy.celestial_body_repo.elements) {
        assert(typeof body.name === "string" && Array.isArray(body.orbits) && Array.isArray(body.regions)
            && body.orbits.every(id => repository_get(galaxy.celestial_body_repo, id) !== undefined)
            && body.regions.every(id => repository_get(galaxy.region_repo, id) !== undefined), "Invalid celestial body");
    }
    for (const region of galaxy.region_repo.elements) {
        assert(typeof region.name === "string" && Array.isArray(region.areas)
            && region.areas.every(id => repository_get(galaxy.area_repo, id) !== undefined), "Invalid region");
    }
    for (const area of galaxy.area_repo.elements) {
        assert(typeof area.name === "string" && Array.isArray(area.rooms)
            && area.rooms.every(id => repository_get(galaxy.room_repo, id) !== undefined), "Invalid area");
    }
    for (const inventory of world.inventory_repo.elements) {
        assert(Array.isArray(inventory.item_stack) && Number.isSafeInteger(inventory.__current_intenal_item_id)
            && inventory.__current_intenal_item_id >= 0, "Invalid inventory");
        const item_ids = new Set();
        for (const stack of inventory.item_stack) {
            assert(!!stack && Number.isSafeInteger(stack.id) && stack.id >= 0 && stack.id < inventory.__current_intenal_item_id
                && !item_ids.has(stack.id) && item_is_valid(stack.item), "Invalid inventory item");
            item_ids.add(stack.id);
        }
    }
    for (const room of galaxy.room_repo.elements) {
        assert(typeof room.name === "string" && Object.hasOwn(ROOM_KIND, room.kind) && Number.isFinite(room.layer)
            && !!room.exits && typeof room.exits === "object" && !Array.isArray(room.exits)
            && Array.isArray(room.content), "Invalid room");
        for (const exit of Object.values(room.exits)) {
            assert(!!exit && repository_get(galaxy.room_repo, exit.target_id) !== undefined, "Unknown room exit");
        }
        room.exits = Object.assign(Object.create(null), room.exits);
        const ore_ids = new Set();
        for (const ore of room.content) {
            assert(!!ore && Number.isSafeInteger(ore.internal_id) && ore.internal_id >= 0 && !ore_ids.has(ore.internal_id)
                && Array.isArray(ore.composition) && ore.composition.every(stack => !!stack && materialitem_is_valid(stack.material_item)), "Invalid ore");
            const restored_ore = ore_create(ore);
            ore.required_mining_level = restored_ore.required_mining_level;
            ore.tool_kind = restored_ore.tool_kind;
            ore_ids.add(ore.internal_id);
        }
        room.entities = [];
    }
    const owned_inventories = new Set();
    for (const entity of world.entity_repo.elements) {
        const room = repository_get(galaxy.room_repo, entity.room_id);
        assert(typeof entity.name === "string" && !!room
            && repository_get(world.inventory_repo, entity.inventory_id) !== undefined
            && !owned_inventories.has(entity.inventory_id)
            && (entity.tool === undefined || item_is_valid(entity.tool) && entity.tool.kind === "PICKAXE"), "Invalid entity");
        room.entities.push(entity.id);
        owned_inventories.add(entity.inventory_id);
    }
    for (const event of world.timeline_scheduler.repo.elements) {
        assert(["craft_complete", "building_complete", "potion_effect"].includes(event.kind)
            && !!event.payload && typeof event.payload === "object", "Invalid timeline event");
    }
    timelinescheduler_rebuild_heap(world.timeline_scheduler);
    return world;
}
