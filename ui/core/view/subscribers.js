// ui/core/view/subscribers.js
// @ts-check

/** @type {Map<string, (prev: {DeepReadonly<Model>|null, next: {DeepReadonly<Model>) => void>} */
let subscribers = new Map();

/**
 * @param {string} key
 * @param {(prev: {DeepReadonly<Model>|null, next: {DeepReadonly<Model>) => void} fn
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
 * @param {DeepReadonly<Model>|null} prev
 * @param {DeepReadonly<Model>} next 
 */
export function notify(prev, next) { subscribers.forEach(fn => fn(prev, next)); }
