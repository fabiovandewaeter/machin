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

/**
 * @template T, E
 * @param {Res<T, E>} res
 * @param {T} fallback
 * @returns {T}
 */
export const unwrap_or = (res, fallback) => is_ok(res) ? res.value : fallback;

/**
 * Throw si Err, narrow `res` en Ok après l'appel.
 * @template T, E
 * @param {Res<T, E>} res
 * @param {string} [msg]
 * @returns {asserts res is Ok<T, E>}
 */
export const assert_ok = (res, msg) => {
    if (is_err(res)) {
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
export const assert_err = (res, msg) => {
    if (is_ok(res)) {
        throw new Error(msg ?? `Expected Err, got Ok(${String(res.value)})`);
    }
};

/**
 * @template T, U, E
 * @param {Res<T, E>} res
 * @param {(val: T) => U} fn
 * @returns {Res<U, E>}
 */
export const map = (res, fn) => is_ok(res) ? ok(fn(res.value)) : res;
