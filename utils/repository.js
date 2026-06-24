// utils/repository.js
// @ts-check

import { some, none } from "./option.js"
import { ok, err } from "./result.js"

/**
 * @template T
 * @template {number} TID
 * @typedef {Object} Repo
 * @property {TID} current_id
 * @property {Record<TID, T>} elements
 */

/**
 * @template T
 * @template {number} TID
 * @returns {Repo<T, TID>}
 */
export function create() { return { current_id: /**@type {TID}*/(0), elements: /** @type {Record<TID, T>}*/({}) }; }

/**
 * @template T
 * @template {number} TID
 * @template {Omit<T, "id">} TSpawnArgs
 * @param {D<Repo<T, TID>>} repo
 * @param {TSpawnArgs} args
 * @returns {[D<Repo<T, TID>>, T]}
 */
export function spawn_element(repo, args) {
    let repo_thaw = /**@type {Repo<T, TID>} */(repo);
    const id = repo_thaw.current_id;
    const new_element = /**@type {T} */({ id, ...args });
    /**@type {Repo<T,TID>} */
    const new_repo = {
        ...repo_thaw,
        current_id: next_id(repo),
        elements: {
            ...repo_thaw.elements,
            [id]: new_element
        }
    };
    return [/**@type {D<Repo<T, TID>>}*/(new_repo), new_element];
}

/**
 * @template {{id: TID}} T
 * @template {number} TID
 * @param {D<Repo<T, TID>>} repo
 * @param {T} element
 * @returns {D<Repo<T, TID>>}
 */
export function replace(repo, element) {
    let repo_thaw = /**@type {Repo<T, TID>} */(repo);
    const res = {
        ...repo,
        current_id: next_id(repo),
        elements: {
            ...repo_thaw.elements,
            [element.id]: element
        }
    };
    return /**@type {D<Repo<T, TID>>} */(res);
}

/**
 * @template T
 * @template {number} TID
 * @param {D<Repo<T, TID>>} repo
 * @param {TID} id
 * @returns {Opt<D<T>>}
 */
export function get(repo, id) {
    let repo_thaw = /**@type {Repo<T, TID>} */(repo);
    const res = repo_thaw.elements[id];
    return res != null && res !== undefined ? some(/**@type {D<T>}*/(res)) : none;
}

/**
 * @template T
 * @template {number} TID
 * @param {D<Repo<T, TID>>} repo
 * @returns {TID}
 */
export function next_id(repo) { return /**@type {TID}*/(repo.current_id + 1); }

/**
 * @template T
 * @template {number} TID
 * @param {D<Repo<T, TID>>} repo
 * @param {TID} id
 * @returns {Res<D<Repo<T, TID>>, string>}
 */
export function remove(repo, id) {
    let repo_thaw = /**@type {Repo<T, TID>} */(repo);
    if (!(id in repo_thaw.elements)) return err(`Couldn't delete element: ${id}`);
    const { [id]: _, ...rest } = repo_thaw.elements;
    return ok(/**@type {D<Repo<T, TID>>}*/({
        ...repo_thaw,
        elements: /**@type {Record<TID, T>}*/(rest)
    }));
}

/**
 * @template T
 * @template {number} TID
 * @param {D<Repo<T, TID>>} repo
 * @return {TID[]}
 */
export function all_ids(repo) { return /**@type {TID[]}*/(Object.keys(repo.elements).map(Number)); }

/**
 * @template T
 * @template {number} TID
 * @param {D<Repo<T, TID>>} repo
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
