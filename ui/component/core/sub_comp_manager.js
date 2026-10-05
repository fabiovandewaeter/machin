// ui/core/component/core/sub_comp_manager.js
// @ts-check

import "../../../utils/types.js"
/**
 * @typedef {import("./comp.js").DestroyFunction} DestroyFunction
 */

/**
 * @typedef {Object} SubComp
 * @property {DestroyFunction} destroy
 */

/**
 * @typedef {string} SubCompKey
 * 
 * @typedef {Object} SubCompManager
 * @property {Map<SubCompKey, SubComp>} sub_comps
 */

/**
 * @returns {SubCompManager}
 */
export function create() { return { sub_comps: new Map() } };

/**
 * @param {SubCompManager} manager
 * @param {SubCompKey} key
 * @returns {boolean}
 */
export function has(manager, key) {
    return manager.sub_comps.has(key);
}

/**
 * @param {SubCompManager} manager
 * @param {SubCompKey} key
 * @param {SubComp} sub
 */
export function add(manager, key, sub) {
    // if (manager.sub_comps.has(key)) {
    if (has(manager, key)) {
        throw new Error(`sub_comp_manager: la clé "${String(key)}" existe déjà`);
    }
    manager.sub_comps.set(key, sub);
}

/**
 * @param {SubCompManager} manager
 * @param {SubCompKey} key
 * @returns {boolean} true si un enfant a bien été supprimé
 */
export function remove(manager, key) {
    const sub = manager.sub_comps.get(key);
    if (!sub) return false;
    sub.destroy();
    manager.sub_comps.delete(key);
    return true;
}

/**
 * @param {SubCompManager} manager
 */
export function destroy_all(manager) {
    const reversed = [...manager.sub_comps.values()].reverse();
    for (const sub of reversed) sub.destroy();
    manager.sub_comps.clear();
}

/**
 * Ajoute l'enfant s'il est absent, le détruit s'il est présent. Le cas d'usage
 * "un bouton spawn/destroy un component" (menu, hide_logs...) tient en un appel.
 * @param {SubCompManager} manager
 * @param {SubCompKey} key
 * @param {() => SubComp} create_sub - appelé seulement si besoin de créer
 * @returns {boolean} true si l'enfant vient d'être ajouté, false s'il vient d'être supprimé
 */
export function mount_or_toggle(manager, key, create_sub) {
    if (remove(manager, key)) return false;
    add(manager, key, create_sub());
    return true;
}
