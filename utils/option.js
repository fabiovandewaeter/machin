// utils/option.js

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
export const option_is_some = (opt) => opt._tag === "Some";

/**
 * @template T
 * @param {Opt<T>} opt
 * @returns {opt is None}
 */
export const option_is_none = (opt) => opt._tag === "None";

/**
 * Unwrap or throw
 * @template T
 * @param {Opt<T>} opt
 * @param {string} [msg]
 * @returns {T}
 */
export const option_unwrap = (opt, msg) => {
    return option_expect(opt, msg ?? "Tried to unwrap a None");
}

/**
 * Unwrap or throw a custom error message if None
 * @template T
 * @param {Opt<T>} opt
 * @param {string} msg
 * @returns {T}
 */
export const option_expect = (opt, msg) => {
    if (option_is_some(opt)) return opt.value;
    throw new Error(msg);
}

/**
 * @template T
 * @param {Opt<T>} opt
 * @param {T} fallback
 * @returns {T}
 */
export const option_unwrap_or = (opt, fallback) => option_is_some(opt) ? opt.value : fallback;

/**
 * Unwrap sans throw : retourne `undefined` si None.
 * @template T
 * @param {Opt<T>} opt
 * @returns {T | undefined}
 */
export const option_unwrap_or_undefined = (opt) => option_is_some(opt) ? opt.value : undefined;

/**
 * Throw si None, narrow `opt` en Some après l'appel.
 * @template T
 * @param {Opt<T>} opt
 * @param {string} [msg]
 * @returns {asserts opt is Some<T>}
 */
export const option_assert_some = (opt, msg) => {
    if (option_is_none(opt)) throw new Error(msg ?? "Expected Some, got None");
};

/**
 * Throw si Some, narrow `opt` en None après l'appel.
 * @template T
 * @param {Opt<T>} opt
 * @param {string} [msg]
 * @returns {asserts opt is None}
 */
export const option_assert_none = (opt, msg) => {
    if (option_is_some(opt)) throw new Error(msg ?? `Expected None, got Some(${String(opt.value)})`);
};

/**
 * @template T, U
 * @param {Opt<T>} opt
 * @param {(v: T) => U} fn
 * @returns {Opt<U>}
 */
export const option_map = (opt, fn) => option_is_some(opt) ? some(fn(opt.value)) : none;

/**
 * @template T, U
 * @param {Opt<T>} opt
 * @param {(v: T) => Opt<U>} fn
 * @returns {Opt<U>}
 */
export const option_flat_map = (opt, fn) => option_is_some(opt) ? fn(opt.value) : none;
