// engine/core/timeline/dispatcher.js
// @ts-check

/**
 * @typedef {import("../world").World} World
 */

/**
 * @typedef {import("./event.js").TimelineEvent} TimelineEvent
 * @typedef {import("./event.js").TimelineEventKind} TimelineEventKind
 * 
 * @typedef {(world: World, event: TimelineEvent) => void} TimelineEventHandler
 */

/** @type {Partial<Record<TimelineEventKind, TimelineEventHandler>>} */
const HANDLERS = {};

/**
 * @param {TimelineEventKind} kind
 * @param {TimelineEventHandler} handler
 */
export function register(kind, handler) { HANDLERS[kind] = handler; }

/**
 * @param {World} world 
 * @param {TimelineEvent} event 
 */
export function dispatch(world, event) {
    const handler = HANDLERS[event.kind];
    if (!handler) {
        throw new Error(`Aucun handler enregistré pour l'event kind: ${event.kind}`);
    }
    handler(world, event);
}
