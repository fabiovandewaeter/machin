// utils/result.js

/**
 * @template T, E
 * @typedef {{ readonly _tag: "Ok", readonly value: T}} Ok
 */
/**
 * @template T, E
 * @typedef {{ readonly _tag: "Err", readonly error: E}} Err
 */
/**
 * @template T, E
 * @typedef {Ok<T, E> | Err<T, E>} Res
 */

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
export const result_is_ok = (res) => res._tag === "Ok";

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {res is Err<T, E>}
 */
export const result_is_err = (res) => res._tag === "Err";

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @returns {T}
 */
export const result_unwrap = (res) => {
    if (result_is_ok(res)) return res.value;
    throw new Error(String(res.error));
}

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @param {T} fallback
 * @returns {T}
 */
export const result_unwrap_or = (res, fallback) => result_is_ok(res) ? res.value : fallback;

/**
 * Throw si Err, narrow `res` en Ok après l'appel.
 * @template T, E
 * @param {Res<T, E>} res
 * @param {string} [msg]
 * @returns {asserts res is Ok<T, E>}
 */
export const result_assert_ok = (res, msg) => {
    if (result_is_err(res)) {
        throw new Error(msg ? `${msg}: ${String(res.error)}` : String(res.error));
    }
};

/**
 * Throw si Ok, narrow `res` en Err après l'appel.
 * Utile pour les tests de chemins d'erreur.
 * @template T, E
 * @param {Res<T, E>} res
 * @param {string} [msg]
 * @returns {asserts res is Err<T, E>}
 */
export const result_assert_err = (res, msg) => {
    if (result_is_ok(res)) {
        throw new Error(msg ?? `Expected Err, got Ok(${String(res.value)})`);
    }
};

/**
 * @template T, U, E
 * @param {Res<T, E>} res
 * @param {(val: T) => U} fn
 * @returns {Res<U, E>}
 */
export const result_map = (res, fn) => result_is_ok(res) ? ok(fn(res.value)) : res;
