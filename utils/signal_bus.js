// utils/signal_bus.js

// ======================================================
// Helpers de types
// ======================================================

/** Union des primitives autorisées dans un payload de signal. */
/** @typedef {number | string | boolean | null | undefined} Primitive */

/**
 * Restreint un type aux primitives (les objets sont exclus pour ne jamais
 * partager de référence mutable entre l'émetteur et les listeners).
 * @template T
 * @typedef {T extends Primitive ? T : never} AsPrimitive
 */

/** Valeur transportable dans un signal : Option déballée puis restreinte aux primitives.
 *  @template T @typedef {AsPrimitive<T>} SignalValue */

/** `true` si T (Option déballée) est transportable. Pour les scalaires. 
 *  @template T @typedef {[T] extends [Primitive] ? true : false} IsSignalable */

/** `true` si T est une primitive nue (pas d'Option). Pour les éléments de tableau.
 *  @template T @typedef {T extends Primitive ? true : false} IsPrimitive */

/** Élément d'un tableau.
 * @template T @typedef {T extends (infer E)[] ? E : never} ArrayElement */

/** `true` si T est un dictionnaire (`Record<string, V>`).
 *  @template T @typedef {string extends keyof T ? true : false} IsMapLike */

// ======================================================
// Tuples de payload
// ======================================================

/** `{ <Base>_id, previous_<Attr>, new_<Attr> }` pour un `.changed`.
 *  @template Id @template {string} Base @template {string} Attr @template T
 *  @typedef {[
 *      Record<`${Base}_id`, Id>
 *    & Record<`previous_${Attr}`, SignalValue<T>>
 *    & Record<`new_${Attr}`, SignalValue<T>>
 *  ]} ChangedTuple
 */

/** `{ <Base>_id, added }` pour un `.added`.
 *  @template Id @template {string} Base @template T
 *  @typedef {[Record<`${Base}_id`, Id> & { added: T }]} AddedTuple
 */

/** `{ <Base>_id, removed }` pour un `.removed`.
 *  @template Id @template {string} Base @template T
 *  @typedef {[Record<`${Base}_id`, Id> & { removed: T }]} RemovedTuple
 */

/** `{ <Base>_id, key }` pour `.set` / `.deleted` (on ne transmet QUE la clé).
 *  @template Id @template {string} Base
 *  @typedef {[Record<`${Base}_id`, Id> & { key: string }]} KeyTuple
 */

// ======================================================
// Génération des signaux
// ======================================================

/**
 * Signaux `.added` / `.removed` pour les attributs tableaux d'éléments primitifs.
 * @template {string} Base @template Id @template {Record<string, unknown>} T
 * @template {"added" | "removed"} S
 * @typedef {{
 *   [K in keyof T & string as T[K] extends unknown[]
 *     ? IsPrimitive<ArrayElement<T[K]>> extends true ? `${Base}.${K}.${S}` : never
 *     : never
 *   ]: S extends "added"
 *     ? AddedTuple<Id, Base, ArrayElement<T[K]>>
 *     : RemovedTuple<Id, Base, ArrayElement<T[K]>>
 * }} ArraySignals
 */

/**
 * Signaux `.set` / `.deleted` pour les attributs dictionnaires.
 * On ne transmet que la clé : les valeurs sont typiquement des objets.
 * @template {string} Base @template Id @template {Record<string, unknown>} T
 * @template {"set" | "deleted"} S
 * @typedef {{
 *   [K in keyof T & string as T[K] extends unknown[]
 *     ? never
 *     : IsMapLike<T[K]> extends true ? `${Base}.${K}.${S}` : never
 *   ]: KeyTuple<Id, Base>
 * }} DictSignals
 */

/**
 * Signaux `.changed` pour les attributs scalaires signalables
 * (ni tableau, ni dictionnaire, valeur primitive après unwrap d'Option).
 * @template {string} Base @template Id @template {Record<string, unknown>} T
 * @typedef {{
 *   [K in keyof T & string as T[K] extends unknown[]
 *     ? never
 *     : IsMapLike<T[K]> extends true
 *       ? never
 *       : IsSignalable<T[K]> extends true ? `${Base}.${K}.changed` : never
 *   ]: ChangedTuple<Id, Base, K, T[K]>
 * }} ScalarSignals
 */

/**
 * Map complète des signaux générés pour T.
 * @template {string} Base @template Id @template {Record<string, unknown>} T
 * @typedef {ArraySignals<Base, Id, T, "added">
 *         & ArraySignals<Base, Id, T, "removed">
 *         & DictSignals<Base, Id, T, "set">
 *         & DictSignals<Base, Id, T, "deleted">
 *         & ScalarSignals<Base, Id, T>} ChangedSignals
 */

// ======================================================
// Variante singleton (payload sans id) — World, GameState…
// ======================================================

/** @template {string} Attr @template T
 *  @typedef {[
 *      Record<`previous_${Attr}`, SignalValue<T>>
 *    & Record<`new_${Attr}`, SignalValue<T>>
 *  ]} SingletonChangedTuple
 */

/** @template {string} Base @template {Record<string, unknown>} T
 *  @typedef {{
 *    [K in keyof T & string as IsSignalable<T[K]> extends true
 *      ? `${Base}.${K}.changed`
 *      : never]: SingletonChangedTuple<K, T[K]>
 *  }} SingletonChangedSignals
 */

// ======================================================
// SignalBus
// ======================================================

/** @template {string} SType @template {Record<SType, unknown[]>} M
 *  @typedef {Object} SignalBus
 *  @property {Partial<{ [K in SType]: Array<(...args: M[K]) => void> }>} listeners
 */

/** @template {string} SType @template {Record<SType, unknown[]>} M
 *  @returns {SignalBus<SType, M>} */
export function signalbus_create() { return { listeners: Object.create(null) }; }

/** @template {string} SType @template {Record<SType, unknown[]>} M @template {SType} K
 *  @param {SignalBus<SType, M>} bus
 *  @param {K} signal_kind
 *  @param {(...args: M[K]) => void} callback
 *  @returns {() => void} */
export function signalbus_on(bus, signal_kind, callback) {
    const handlers = bus.listeners[signal_kind] ?? [];
    if (handlers.includes(callback)) throw new Error(`duplicate: ${String(signal_kind)}`);
    bus.listeners[signal_kind] = [...handlers, callback];
    return () => signalbus_off(bus, signal_kind, callback);
}

/** @template {string} SType @template {Record<SType, unknown[]>} M @template {SType} K
 *  @param {SignalBus<SType, M>} bus
 *  @param {K} signal_kind
 *  @param {(...args: M[K]) => void} callback */
export function signalbus_off(bus, signal_kind, callback) {
    const handlers = bus.listeners[signal_kind];
    if (!handlers?.length) return;
    const next = handlers.filter(cb => cb !== callback);
    if (next.length === 0) delete bus.listeners[signal_kind];
    else bus.listeners[signal_kind] = next;
}

/** @template {string} SType @template {Record<SType, unknown[]>} M @template {SType} K
 *  @param {SignalBus<SType, M>} bus
 *  @param {K} signal_kind
 *  @param {M[K]} args */
export function signalbus_emit(bus, signal_kind, ...args) {
    const handlers = bus.listeners[signal_kind];
    if (!handlers?.length) return;
    for (const callback of handlers) callback(...args);
}

/** @template {string} SType @template {Record<SType, unknown[]>} M
 *  @param {SignalBus<SType, M>} bus */
export function signalbus_clear(bus) {
    bus.listeners = Object.create(null);
}
