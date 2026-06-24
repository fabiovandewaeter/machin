// utils/result.js
// @ts-check

/**
 * @template T, E
 * @param {T} value
 * @returns {Ok<T,E>}
 */
export const ok = (value) => ({ _tag: "Ok", value });

/**
 * @template T, E
 * @param {E} error
 * @returns {Err<T,E>}
 */
export const err = (error) => ({ _tag: "Err", error });

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {res is Ok<T, E>}
 */
export const is_ok = (res) => res._tag === "Ok";

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {res is Err<T, E>}
 */
export const is_err = (res) => res._tag === "Err";

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */
export const unwrap = (res) => {
    if (is_ok(res)) return res.value;
    throw new Error(String(res.error));
}

// /**
//  * @template T, E
//  * @param {Res<T, E>} res
//  * @param {string} [msg]
//  * @returns {T}
//  */
// export const expect = (res, msg) => {
//     if (is_ok(res)) return res.value;
//     throw new Error(msg ? `${msg}: ${String(res.error)}` : String(res.error));
// }

// /** for pipe @type {(msg?: string) => <T, E>(res: Res<T, E>) => T} */
// export const expect_ = (msg) => (res) => expect(res, msg);

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @param {T} fallback
 * @returns {T}
 */
export const unwrap_or = (res, fallback) => is_ok(res) ? res.value : fallback;

/** for pipe @type {<T>(fallback: T) => <E>(res: Res<T, E>) => T} */
export const unwrap_or_ = (fallback) => (res) => unwrap_or(res, fallback);

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {void}
 */
export const assert_ok = (res) => {
    if (is_err(res)) throw new Error(String(res.error));
};

/**
 * @template T, U, E
 * @param {Res<T, E>} res
 * @param {(val: T) => U} fn
 * @returns {Res<U, E>}
 */
export const map = (res, fn) => is_ok(res) ? ok(fn(res.value)) : res;

/** for pipe @type {<T, U, E>(fn: (val: T) => U) => (res: Res<T, E>) => Res<U, E>} */
export const map_ = (fn) => (res) => map(res, fn);

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */
