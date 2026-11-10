// engine/core/world/world.types.js

/**
 * @typedef {import("../clock.js").Clock} Clock
 * @typedef {import("../timeline/scheduler.js").TimelineScheduler} TimelineScheduler
 * @typedef {import("../../map/galaxy.js").Galaxy} Galaxy
 * @typedef {import("../../entity/entity.types.js").EntityRepo} EntityRepo
 * @typedef {import("../../inventory/inventory.types.js").InventoryRepo} InventoryRepo
 * @typedef {import("../../../utils/random_generator.js").RandomGenerator} RandomGenerator
 */

/**
 * @typedef {Object} World
 * @prop {Clock} clock
 * @prop {RandomGenerator} random_generator
 * @prop {TimelineScheduler} timeline_scheduler 
 * @prop {Galaxy} galaxy
 * @prop {EntityRepo} entity_repo
 * @prop {InventoryRepo} inventory_repo
 */
