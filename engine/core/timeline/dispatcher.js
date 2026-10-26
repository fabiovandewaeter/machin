// engine/core/timeline/dispatcher.js

import { enginesignals_batch } from "../signal/signal.js";

/**
 * @typedef {import("../world/world.types.js").World} World
 */

/**
 * @typedef {import("./event.js").TimelineEvent} TimelineEvent
 * @typedef {import("./event.js").TimelineEventKind} TimelineEventKind
 * 
 * @typedef {(world: World, event: TimelineEvent) => void} TimelineEventHandler
 */

/** @type {Partial<Record<TimelineEventKind, TimelineEventHandler>>} */
const __HANDLERS = {};

/**
 * @param {TimelineEventKind} kind
 * @param {TimelineEventHandler} handler
 */
export function timelinedispatcher_register(kind, handler) { __HANDLERS[kind] = handler; }

/**
 * @param {World} world 
 * @param {TimelineEvent} event 
 */
export function timelinedispatcher_dispatch(world, event) {
    enginesignals_batch(() => {
        const handler = __HANDLERS[event.kind];
        if (!handler) {
            throw new Error(`Aucun handler enregistré pour l'event kind: ${event.kind}`);
        }
        handler(world, event);
    });
}
