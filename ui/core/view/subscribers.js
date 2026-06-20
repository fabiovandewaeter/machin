// ui/core/view/subscribers.js
// @ts-check

/** @type {Map<string, (prev: Readonly<Model>|null, next: Readonly<Model>) => void>} */
let subscribers = new Map();

/**
 * @param {string} key
 * @param {(prev: Readonly<Model>|null, next: Readonly<Model>) => void} fn
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
 * @param {Readonly<Model>|null} prev
 * @param {Readonly<Model>} next 
 */
export function notify(prev, next) { subscribers.forEach(fn => fn(prev, next)); }
