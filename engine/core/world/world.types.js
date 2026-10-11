// engine/core/world/world.types.js

/**
 * @typedef {import("../clock.js").Clock} Clock
 * @typedef {import("../timeline/scheduler.js").TimelineScheduler} TimelineScheduler
 * @typedef {import("../../map/galaxy.js").Galaxy} Galaxy
 * @typedef {import("../../entity/entity.types.js").EntityRepo} EntityRepo
 */

/**
 * @typedef {Object} World
 * @property {Clock} clock
 * @property {TimelineScheduler} timeline_scheduler 
 * @property {Galaxy} galaxy
 * @property {EntityRepo} entity_repo
 */
