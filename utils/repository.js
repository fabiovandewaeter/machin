// utils/repository.js
// @ts-check

import { some, none } from "./option.js"
import { ok, err } from "./result.js"

/**
 * @template T
 * @template {number} TID
 * @typedef {Object} Repository
 * @property {TID} current_id
 * @property {Record<TID, T>} elements
 */

/**
 * @template T
 * @template {number} TID
 * @returns {Repository<T, TID>}
 */
export function create() { return { current_id: /**@type {TID}*/(0), elements: /** @type {Record<TID, T>}*/({}) }; }

/**
 * @template T
 * @template {number} TID
 * @template {Omit<T, "id">} TSpawnArgs
 * @param {Readonly<Repository<T, TID>>} repo
 * @param {TSpawnArgs} args
 * @returns {[Repository<T, TID>, TID]}
 */
export function spawn_element(repo, args) {
    const id = repo.current_id;
    const new_repo = {
        ...repo,
        current_id: next_id(repo),
        elements: {
            ...repo.elements,
            [id]: /**@type {T} */({ id, ...args })
        }
    };
    return [new_repo, id];
}

/**
 * @template T
 * @template {number} TID
 * @param {Readonly<Repository<T, TID>>} repo
 * @param {TID} id
 * @param {T} element
 * @returns {Repository<T, TID>}
 */
export function replace(repo, id, element) {
    return {
        ...repo,
        current_id: next_id(repo),
        elements: {
            ...repo.elements,
            [id]: element
        }
    };
}

/**
 * @template T
 * @template {number} TID
 * @param {Readonly<Repository<T, TID>>} repo
 * @param {TID} id
 * @returns {import("./option").Opt<T>}
 */
export function get(repo, id) {
    const res = repo.elements[id];
    return res != null && res !== undefined ? some(res) : none;
}

/**
 * @template T
 * @template {number} TID
 * @param {Readonly<Repository<T, TID>>} repo
 * @returns {TID}
 */
export function next_id(repo) { return /**@type {TID}*/(repo.current_id + 1); }

/**
 * @template T
 * @template {number} TID
 * @param {Readonly<Repository<T, TID>>} repo
 * @param {TID} id
 * @returns {import("./result").Result<Repository<T, TID>, string>}
 */
export function remove(repo, id) {
    if (!(id in repo.elements)) return err(`Couldn't delete element: ${id}`);
    const { [id]: _, ...rest } = repo.elements;
    return ok({
        ...repo,
        elements: /**@type {Record<TID, T>}*/(rest)
    });
}

/**
 * @template T
 * @template {number} TID
 * @param {Readonly<Repository<T, TID>>} repo
 * @return {TID[]}
 */
export function all_ids(repo) { return /**@type {TID[]}*/(Object.keys(repo.elements).map(Number)); }

/**
 * @template T
 * @template {number} TID
 * @param {Readonly<Repository<T, TID>>} repo
 * @return {T[]}
 */
export function all(repo) { return Object.values(repo.elements); }

/**
 * @template {number} TID
 * @param {string|undefined} id_string
 * @returns {TID}
 */
export function id_string_to_id(id_string) {
    if (!id_string) throw new Error();
    return  /**@type {TID}*/(parseInt(id_string, 10));
}
