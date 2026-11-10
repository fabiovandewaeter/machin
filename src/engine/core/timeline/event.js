// engine/core/timeline/event.js

/**
 * @import {TimelineEventID} from "../ids.types.js"
 * @import {Repo} from "../../../utils/repository.js"
 */

// craft_complete, building_complete, potion_effect ...

/**
 * @typedef {Object} TimelineEvent
 * @prop {TimelineEventID} id
 * @prop {TimelineEventKind} kind
 * @prop {number} at
 * @prop {Object} payload
 * 
 * @typedef {'craft_complete'|'building_complete'|'potion_effect'} TimelineEventKind
 * @typedef {Repo<TimelineEventID, TimelineEvent>} TimelineEventRepo
 */

export { };
