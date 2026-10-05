// utils/types.js
// @ts-check

// ========== utils ==========
/**
 * Extrait l'union des valeurs d'un objet constant.
 * @template {Record<string, unknown>} T
 * @typedef {T[keyof T]} EnumValue
 */
/**
 * Extrait les clés d'un objet constant
 * @template {Record<string, unknown>} T
 * @typedef {keyof T & string} EnumKey
 */

// -- deep readonly --
/**
 * Pareil que Readonly quand on modifie (car obligé de faire un cast inline) mais bloque
 * mieux dans les fonctions qui font que lire
 * @template T
 * @typedef {T extends (...args: any[]) => any
 *   ? T
 *   : T extends Date | RegExp | Error | bigint | string | number | boolean | symbol | null | undefined
 *     ? T
 *     : T extends Map<infer K, infer V>
 *       ? ReadonlyMap<D<K>, D<V>>
 *       : T extends Set<infer U>
 *         ? ReadonlySet<D<U>>
 *         : T extends readonly any[]
 *           ? { readonly [K in keyof T]: D<T[K]> }
 *           : T extends object
 *             ? { readonly [K in keyof T]: D<T[K]> }
 *             : T
 * } D
 */
// -------------------

// -- option --
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
// ------------

// -- result --
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
// ------------
