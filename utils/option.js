// utils/option.js
// @ts-check

/**
 * @template T
 * @typedef {{ readonly _tag: "Some", readonly value: T}} Some
 */

/**
 * @typedef {{ readonly _tag: "None"}} None
 */

/**
 * @template T
 * @typedef { Some<T> | None} Opt
 */

/**
 * @template T
 * @param {T} value
 * @returns {Some<T>}
 */
export const some = (value) => ({ _tag: "Some", value });

/** @type {None} */
export const none = Object.freeze({ _tag: "None" });

/**
 * @template T
 * @param {Opt<T>} opt
 * @returns {opt is Some<T>}
 */
export const is_some = (opt) => opt._tag === "Some";

/**
 * @template T
 * @param {Opt<T>} opt
 * @returns {opt is None}
 */
export const is_none = (opt) => opt._tag === "None";

/**
 * Unwrap or throw
 * @template T
 * @param {Opt<T>} opt
 * @param {string} [msg]
 * @returns {T}
 */
export const unwrap = (opt, msg) => {
    if (is_some(opt)) return opt.value;
    throw new Error(msg ?? "Tried to unwrap a None");
}

/**
 * Unwrap or throw a custom error message if None
 * @template T
 * @param {Opt<T>} opt
 * @param {string} msg
 * @returns {T}
 */
export const expect = (opt, msg) => {
    if (is_some(opt)) return opt.value;
    throw new Error(msg);
}

/** for pipe @type {(msg: string) => <T>(opt: Opt<T>) => T} */
export const expect_ = (msg) => (opt) => expect(opt, msg);

/**
 * @template T
 * @param {Opt<T>} opt
 * @param {T} fallback
 * @returns {T}
 */
export const unwrap_or = (opt, fallback) => is_some(opt) ? opt.value : fallback;

/** for pipe @type {<T>(fallback: T) => (opt: Opt<T>) => T} */
export const unwrap_or_ = (fallback) => (opt) => unwrap_or(opt, fallback);

/**
 * @template T, U
 * @param {Opt<T>} opt
 * @param {(v: T) => U} fn
 * @returns {Opt<U>}
 */
export const map = (opt, fn) => is_some(opt) ? some(fn(opt.value)) : none;

/** for pipe @type {<T, U>(fn: (v: T) => U) => (opt: Opt<T>) => Opt<U>} */
export const map_ = (fn) => (opt) => map(opt, fn);

/**
 * @template T, U
 * @param {Opt<T>} opt
 * @param {(v: T) => Opt<U>} fn
 * @returns {Opt<U>}
 */
export const flat_map = (opt, fn) => is_some(opt) ? fn(opt.value) : none;

/** for pipe @type {<T, U>(fn: (v: T) => Opt<U>) => (opt: Opt<T>) => Opt<U>} */
export const flat_map_ = (fn) => (opt) => flat_map(opt, fn);
