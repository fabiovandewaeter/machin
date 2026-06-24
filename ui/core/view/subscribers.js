// ui/core/view/subscribers.js
// @ts-check

import '../../../utils/types.js'

/** @type {Map<string, (prev: D<Model>|null, next: D<Model>) => void>} */
let subscribers = new Map();

/**
 * @param {string} key
 * @param {(prev: D<Model>|null, next: D<Model>) => void} fn
 */
export function subscribe(key, fn) {
    if (subscribers.has(key)) throw new Error();
    subscribers.set(key, fn);
}

/**
 * @param {string} key 
 */
export function unsubscribe(key) { subscribers.delete(key); }

export function clear() { subscribers = new Map(); }

/**
 * @param {D<Model>|null} prev
 * @param {D<Model>} next 
 */
export function notify(prev, next) { subscribers.forEach(fn => fn(prev, next)); }
