// utils/repository.js

/** @template T, E @typedef {import("./result.js").Res<T, E>} Res */
import { ok, err } from "./result.js";

/**
 * @template {number} TID
 * @template {{ id: TID }} T
 * @typedef {Object} Repo
 * @property {TID} current_id
 * @property {T[]} elements
 * @property {Record<TID, number>} indices
 */

const __MAX_SAFE_ID = Number.MAX_SAFE_INTEGER;

/**
 * @template {number} TID
 * @template {{ id: TID }} T
 * @returns {Repo<TID, T>}
 */
export function repository_create() {
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
export function repository_spawn_element(repo, args) {
    const id = repo.current_id;

    // Validate before mutating anything.
    const next = repository_next_id(repo);

    const new_element = /** @type {T} */ (
    /** @type {unknown} */ ({ ...args, id })
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
 * @returns {T|undefined} pas Opt<T> pour ne pas allouer un some à chaque fois
 */
export function repository_get(repo, id) {
    if (!Number.isSafeInteger(id) || id < 0) return undefined;
    const index = repo.indices[id];

    if (index === undefined) {
        return undefined;
    }

    return repo.elements[index];
}

/**
 * @template {{ id: TID }} T
 * @template {number} TID
 * @param {Repo<TID, T>} repo
 * @returns {TID}
 */
export function repository_next_id(repo) {
    if (!Number.isSafeInteger(repo.current_id) || repo.current_id < 0 || repo.current_id >= __MAX_SAFE_ID) {
        throw new Error(
            `Repository ID limit reached: ${__MAX_SAFE_ID}`
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
export function repository_remove_element(repo, id) {
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
export function repository_all_ids(repo) {
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
export function repository_all(repo) {
    return repo.elements.slice();
}

/**
 * @template {number} TID
 * @template {{ id: TID }} T
 * @param {Repo<TID, T>} repo
 */
export function repository_reindex(repo) {
    if (!repo || !Array.isArray(repo.elements) || !Number.isSafeInteger(repo.current_id) || repo.current_id < 0) {
        throw new Error("Invalid repository");
    }
    const indices = /** @type {Record<TID, number>} */ (Object.create(null));
    for (let index = 0; index < repo.elements.length; index++) {
        const element = repo.elements[index];
        if (!element || !Number.isSafeInteger(element.id) || element.id < 0 || element.id >= repo.current_id || Object.hasOwn(indices, element.id)) {
            throw new Error("Invalid repository element ID");
        }
        indices[element.id] = index;
    }
    repo.indices = indices;
}
