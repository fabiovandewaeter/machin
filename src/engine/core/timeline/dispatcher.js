// engine/core/timeline/dispatcher.js

import { assert } from "../../../utils/assert.js";
import { enginesignals_batch } from "../signal/signal.js";

/**
 * @import {World} from "../world/world.types.js"
 */

/**
 * @import {TimelineEvent} from "./event.js"
 * @import {TimelineEventKind} from "./event.js"
 * 
 * @typedef {(world: World, event: TimelineEvent) => void} TimelineEventHandler
 */

/** @type {Partial<Record<TimelineEventKind, TimelineEventHandler>>} */
let __HANDLERS = Object.create(null);

export function timelinedispatcher_clear_handlers() {
    __HANDLERS = Object.create(null);
}

/**
 * @param {TimelineEventKind} kind
 * @param {TimelineEventHandler} handler
 */
export function timelinedispatcher_register(kind, handler) { __HANDLERS[kind] = handler; }

/**
 * @param {string} kind
 * @returns {kind is TimelineEventKind}
 */
export function timelinedispatcher_has_handler(kind) { return Object.hasOwn(__HANDLERS, kind); }

/**
 * @param {World} world 
 * @param {TimelineEvent} event 
 */
export function timelinedispatcher_dispatch(world, event) {
    enginesignals_batch(() => {
        const handler = __HANDLERS[event.kind];
        assert(handler, `Aucun handler enregistré pour l'event kind: ${event.kind}`);
        return handler(world, event);
    });
}
