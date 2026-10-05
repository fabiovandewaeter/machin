// engine/core/timeline/heap.js
// @ts-check

/**
 * @typedef {import("./event.js").TimelineEventID} TimelineEventID
 */
import "../../../utils/types.js"

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
export function is_before(a, b) {
    return a.at !== b.at ? a.at < b.at : a.id < b.id;
}

/**
 * @param {HeapEntry[]} heap
 * @param {HeapEntry} entry
 */
export function push(heap, entry) {
    heap.push(entry);
    sift_up(heap, heap.length - 1);
}

/**
 * @param {HeapEntry[]} heap
 * @returns {HeapEntry|undefined}
 */
export function pop(heap) {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0 && last !== undefined) {
        heap[0] = last;
        sift_down(heap, 0);
    }
    return top;
}

/**
 * @param {HeapEntry[]} heap
 * @param {number} i
 */
function sift_up(heap, i) {
    while (i > 0) {
        const parent = (i - 1) >> 1;
        if (!is_before(heap[i], heap[parent])) break;
        [heap[i], heap[parent]] = [heap[parent], heap[i]];
        i = parent;
    }
}

/**
 * @param {HeapEntry[]} heap
 * @param {number} i
 */
function sift_down(heap, i) {
    const n = heap.length;
    while (true) {
        let smallest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && is_before(heap[l], heap[smallest])) smallest = l;
        if (r < n && is_before(heap[r], heap[smallest])) smallest = r;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
    }
}
