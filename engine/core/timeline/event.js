// engine/core/timeline/types.js
// @ts-check

// craft_complete, building_complete, potion_effect ...

/**
 * @typedef {Object} TimelineEvent
 * @property {TimelineEventID} id
 * @property {TimelineEventKind} kind
 * @property {number} at
 * @property {Object} payload
 * 
 * @typedef {'craft_complete'|'building_complete'|'potion_effect'} TimelineEventKind
 * @typedef {number & {readonly __brand:"TimelineEventID"}} TimelineEventID
 * @typedef {import("../../../utils/repository.js").Repo<TimelineEventID, TimelineEvent>} TimelineEventRepo
 */

export { };
