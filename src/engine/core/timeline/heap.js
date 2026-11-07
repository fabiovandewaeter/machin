// engine/core/timeline/heap.js

import { array_get } from "../../../utils/array.js";

/**
 * @typedef {import("../ids.types.js").TimelineEventID} TimelineEventID
 */


/**
 * @typedef {Object} HeapEntry
 * @property {number} at
 * @property {TimelineEventID} id
 */

// --- tas binaire interne (ordonné par at, puis par id pour départager) ---

/**
 * @param {HeapEntry} a
 * @param {HeapEntry} b
 */
export function heap_is_before(a, b) {
    return a.at !== b.at ? a.at < b.at : a.id < b.id;
}

/**
 * @param {HeapEntry[]} heap
 * @param {HeapEntry} entry
 */
export function heap_push(heap, entry) {
    heap.push(entry);
    __heap_sift_up(heap, heap.length - 1);
}

/**
 * @param {HeapEntry[]} heap
 * @returns {HeapEntry|undefined}
 */
export function heap_pop(heap) {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0 && last !== undefined) {
        heap[0] = last;
        __heap_sift_down(heap, 0);
    }
    return top;
}

/**
 * @param {HeapEntry[]} heap
 * @param {number} i
 */
function __heap_sift_up(heap, i) {
    while (i > 0) {
        const parent = (i - 1) >> 1;

        const current_entry = array_get(heap, i);
        const parent_entry = array_get(heap, parent);

        if (!heap_is_before(current_entry, parent_entry)) break;

        heap[i] = parent_entry;
        heap[parent] = current_entry;

        i = parent;
    }
}

/**
 * @param {HeapEntry[]} heap
 * @param {number} i
 */
function __heap_sift_down(heap, i) {
    const n = heap.length;

    while (true) {
        let smallest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        if (l < n && heap_is_before(array_get(heap, l), array_get(heap, smallest))) {
            smallest = l;
        }

        if (r < n && heap_is_before(array_get(heap, r), array_get(heap, smallest))) {
            smallest = r;
        }

        if (smallest === i) break;

        const current_entry = array_get(heap, i);
        const smallest_entry = array_get(heap, smallest);

        heap[i] = smallest_entry;
        heap[smallest] = current_entry;

        i = smallest;
    }
}
