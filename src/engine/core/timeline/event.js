// engine/core/timeline/event.js

/**
 * @typedef {import("../ids.types.js").TimelineEventID} TimelineEventID
 */

// craft_complete, building_complete, potion_effect ...

/**
 * @typedef {Object} TimelineEvent
 * @property {TimelineEventID} id
 * @property {TimelineEventKind} kind
 * @property {number} at
 * @property {Object} payload
 * 
 * @typedef {'craft_complete'|'building_complete'|'potion_effect'} TimelineEventKind
 * @typedef {import("../../../utils/repository.js").Repo<TimelineEventID, TimelineEvent>} TimelineEventRepo
 */

export { };
