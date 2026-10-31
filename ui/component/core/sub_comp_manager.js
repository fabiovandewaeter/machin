/** @typedef {import("./utils.js").DestroyFunction} DestroyFunction */

/**
 * @typedef {{destroy: DestroyFunction}} SubComp
 * @typedef {string} SubCompKey
 * @typedef {{sub_comps: Map<SubCompKey, SubComp>}} SubCompManager
 */

/** @returns {SubCompManager} */
export function subcompmanager_create() {
    return { sub_comps: new Map() };
}

/**
 * @param {SubCompManager} manager
 * @param {SubCompKey} key
 * @returns {boolean}
 */
export function subcompmanager_has(manager, key) {
    return manager.sub_comps.has(key);
}

/**
 * @param {SubCompManager} manager
 * @param {SubCompKey} key
 * @param {SubComp} sub
 */
export function subcompmanager_add(manager, key, sub) {
    if (subcompmanager_has(manager, key)) throw new Error(`Duplicate subcomponent key: ${key}`);
    manager.sub_comps.set(key, sub);
}

/**
 * @param {SubCompManager} manager
 * @param {SubCompKey} key
 * @returns {boolean}
 */
export function subcompmanager_remove(manager, key) {
    const sub = manager.sub_comps.get(key);
    if (!sub) return false;
    manager.sub_comps.delete(key);
    sub.destroy();
    return true;
}

/** @param {SubCompManager} manager */
export function subcompmanager_destroy_all(manager) {
    const children = [...manager.sub_comps.values()].reverse();
    manager.sub_comps.clear();
    /** @type {unknown[]} */
    const errors = [];
    for (const child of children) {
        try {
            child.destroy();
        } catch (error) {
            errors.push(error);
        }
    }
    if (errors.length) throw new AggregateError(errors, "Could not destroy subcomponents");
}

/**
 * @param {SubCompManager} manager
 * @param {SubCompKey} key
 * @param {() => SubComp} create_sub
 * @returns {boolean}
 */
export function subcompmanager_mount_or_toggle(manager, key, create_sub) {
    if (subcompmanager_remove(manager, key)) return false;
    subcompmanager_add(manager, key, create_sub());
    return true;
}
