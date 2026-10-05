// utils/repository.js
// @ts-check

import "./types.js";
import { some, none } from "./option.js";
import { ok, err } from "./result.js";

/**
 * @template {number} TID
 * @template {{ id: TID }} T
 * @typedef {Object} Repo
 * @property {TID} current_id
 * @property {T[]} elements
 * @property {Record<TID, number>} indices
 */

const MAX_SAFE_ID = Number.MAX_SAFE_INTEGER;

/**
 * @template T
 * @template {number} TID
 * @returns {Repo<TID, T>}
 */
export function create() {
    return {
        current_id: /** @type {TID} */ (0),
        elements: [],
        indices: /** @type {Record<TID, number>} */ (Object.create(null)),
    };
}

/**
 * @template {{ id: TID }} T
 * @template {number} TID
 * @template {Omit<T, "id">} TSpawnArgs
 * @param {Repo<TID, T>} repo
 * @param {TSpawnArgs} args
 * @returns {T}
 */
export function spawn_element(repo, args) {
    const id = repo.current_id;

    // Validate before mutating anything.
    const next = next_id(repo);

    const new_element = /** @type {T} */ (
    /** @type {unknown} */ ({ id, ...args })
    );
    const index = repo.elements.length;

    repo.elements.push(new_element);
    repo.indices[id] = index;
    repo.current_id = next;

    return new_element;
}

/**
 * @template {{ id: TID }} T
 * @template {number} TID
 * @param {Repo<TID, T>} repo
 * @param {TID} id
 * @returns {Opt<T>}
 */
export function get(repo, id) {
    const index = repo.indices[id];

    if (index === undefined) {
        return none;
    }

    return some(repo.elements[index]);
}

/**
 * @template {{ id: TID }} T
 * @template {number} TID
 * @param {Repo<TID, T>} repo
 * @returns {TID}
 */
export function next_id(repo) {
    if (repo.current_id >= MAX_SAFE_ID) {
        throw new Error(
            `Repository ID limit reached: ${MAX_SAFE_ID}`
        );
    }

    return /** @type {TID} */ (repo.current_id + 1);
}

/**
 * @template {{ id: TID }} T
 * @template {number} TID
 * @param {Repo<TID, T>} repo
 * @param {TID} id
 * @returns {Res<void, string>}
 */
export function remove_element(repo, id) {
    const index = repo.indices[id];

    if (index === undefined) {
        return err(`Couldn't delete element: ${id}`);
    }

    const last_index = repo.elements.length - 1;

    // swap
    if (index !== last_index) {
        const last_element = repo.elements[last_index];

        repo.elements[index] = last_element;
        repo.indices[last_element.id] = index;
    }

    repo.elements.pop();
    delete repo.indices[id];

    return ok(undefined);
}

/**
 * @template {{ id: TID }} T
 * @template {number} TID
 * @param {Repo<TID, T>} repo
 * @returns {TID[]}
 */
export function all_ids(repo) {
    return /** @type {TID[]} */ (
        repo.elements.map(element => element.id)
    );
}

/**
 * @template {{ id: TID }} T
 * @template {number} TID
 * @param {Repo<TID, T>} repo
 * @returns {T[]}
 */
export function all(repo) {
    return repo.elements.slice();
}
