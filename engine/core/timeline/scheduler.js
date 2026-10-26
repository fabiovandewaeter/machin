// engine/core/timeline/scheduler.js

/**
 * @typedef {import("./heap.js").HeapEntry} HeapEntry
 * @typedef {import("./event.js").TimelineEventKind} TimelineEventKind
 * @typedef {import("./event.js").TimelineEvent} TimelineEvent
 * @typedef {import("../ids.types.js").TimelineEventID} TimelineEventID
 * @typedef {import("./event.js").TimelineEventRepo} TimelineEventRepo
 */
import { repository_all, repository_create, repository_get, repository_remove_element, repository_spawn_element } from "../../../utils/repository.js";

import { heap_pop, heap_push } from "./heap.js";

/**
 * @typedef {Object} TimelineScheduler
 * @property {TimelineEventRepo} repo
 * @property {HeapEntry[]} heap
 */

/** @returns {TimelineScheduler} */
export function timelinescheduler_create() {
    return { repo: repository_create(), heap: [] };
}

/**
 * Planifie un event et le renvoie (avec son id assigné par le repo).
 * @param {TimelineScheduler} scheduler
 * @param {TimelineEventKind} kind
 * @param {number} at
 * @param {Object} payload
 * @returns {TimelineEvent}
 */
export function timelinescheduler_schedule(scheduler, kind, at, payload) {
    const event = repository_spawn_element(scheduler.repo, { kind, at, payload });
    heap_push(scheduler.heap, { at: event.at, id: event.id });
    return event;
}

/**
 * Annule un event planifié. No-op silencieux s'il n'existe plus.
 * @param {TimelineScheduler} scheduler
 * @param {TimelineEventID} id
 * @returns {boolean} true si l'event existait et a été annulé
 */
export function timelinescheduler_cancel(scheduler, id) {
    const existed = repository_get(scheduler.repo, id) !== undefined;
    if (existed) repository_remove_element(scheduler.repo, id);
    return existed;
}

/**
 * @param {TimelineScheduler} scheduler
 * @returns {TimelineEvent|null}
 */
export function timelinescheduler_peek(scheduler) {
    __timelinescheduler_purge_stale(scheduler);
    const top = scheduler.heap[0];
    return top ? repository_get(scheduler.repo, top.id) ?? null : null;
}

/**
 * Dépile et renvoie le prochain event si `at <= target_time`.
 * Sinon renvoie null SANS rien dépiler (l'event reste planifié).
 * @param {TimelineScheduler} scheduler
 * @param {number} target_time
 * @returns {TimelineEvent|null}
 */
export function timelinescheduler_pop_due(scheduler, target_time) {
    __timelinescheduler_purge_stale(scheduler);
    const top = scheduler.heap[0];
    if (!top || top.at > target_time) return null;
    heap_pop(scheduler.heap);
    const event = repository_get(scheduler.repo, top.id);
    repository_remove_element(scheduler.repo, top.id);
    return event ?? null;
}

/**
 * @param {TimelineScheduler} scheduler
 * @returns {TimelineEvent[]} tous les events en attente (non triés) — utile pour debug/UI
 */
export function timelinescheduler_all_pending(scheduler) { return repository_all(scheduler.repo); }

/** @param {TimelineScheduler} scheduler */
function __timelinescheduler_purge_stale(scheduler) {
    while (scheduler.heap.length > 0 && !repository_get(scheduler.repo, scheduler.heap[0].id)) {
        heap_pop(scheduler.heap);
    }
}

// TODO: voir si on garde ça (probablement oui)
// /** @type {Record<TimelineEventKind, number>} */
// const CRAFT_COMPLETE_HANDLERS = {
// };
// export function init_truc() {
//     Event.register("craft_complete", (world, event, scheduler) => {
//         const machine = world.machines[event.payload.machineId];
//         // // Ici on réagit différemment selon le type de machine
//         // switch (machine.kind) {
//         //     case "forge": handleForgeComplete(world, machine, scheduler); break;
//         //     case "alambic": handleAlambicComplete(world, machine, scheduler); break;
//         //     case "botanique": handleBotaniqueComplete(world, machine, scheduler); break;
//         //     // etc.
//         // }
//         CRAFT_COMPLETE_HANDLERS[machine.kind](world, machine, scheduler);
//     });
// }
