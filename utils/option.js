// utils/option.js
// @ts-check

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

/**
 * @template T
 * @param {Opt<T>} opt
 * @param {T} fallback
 * @returns {T}
 */
export const unwrap_or = (opt, fallback) => is_some(opt) ? opt.value : fallback;

/**
 * Unwrap sans throw : retourne `undefined` si None.
 * @template T
 * @param {Opt<T>} opt
 * @returns {T | undefined}
 */
export const unwrap_or_undefined = (opt) => is_some(opt) ? opt.value : undefined;

/**
 * Throw si None, narrow `opt` en Some après l'appel.
 * @template T
 * @param {Opt<T>} opt
 * @param {string} [msg]
 * @returns {asserts opt is Some<T>}
 */
export const assert_some = (opt, msg) => {
    if (is_none(opt)) throw new Error(msg ?? "Expected Some, got None");
};

/**
 * Throw si Some, narrow `opt` en None après l'appel.
 * @template T
 * @param {Opt<T>} opt
 * @param {string} [msg]
 * @returns {asserts opt is None}
 */
export const assert_none = (opt, msg) => {
    if (is_some(opt)) throw new Error(msg ?? `Expected None, got Some(${String(opt.value)})`);
};

/**
 * @template T, U
 * @param {Opt<T>} opt
 * @param {(v: T) => U} fn
 * @returns {Opt<U>}
 */
export const map = (opt, fn) => is_some(opt) ? some(fn(opt.value)) : none;

/**
 * @template T, U
 * @param {Opt<T>} opt
 * @param {(v: T) => Opt<U>} fn
 * @returns {Opt<U>}
 */
export const flat_map = (opt, fn) => is_some(opt) ? fn(opt.value) : none;
