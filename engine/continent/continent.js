// engine/continent/continent.js
// @ts-check

import '../../utils/types.js'
import * as Repo from '../../utils/repository.js'

/** @typedef {number & {__brand:"ContinentID"}} ContinentID*/
/**
 * @typedef {Object} Continent
 * @property {ContinentID} id
 * @property {string} name
 * @property {RegionID[]} regions
 */

/**
 * @param {Readonly<ContinentRepository>} repo
 * @param {string} name
 * @returns {[ContinentRepository, ContinentID]}
 */
export function spawn(repo, name) {
    /** @type {Omit<Continent, "id">} */
    const tempo_continent = {
        name,
        regions: []
    };
    const [new_repo, id] = Repo.spawn_element(repo, tempo_continent);
    return [new_repo, id];
}

/**
 * @param {Readonly<Continent>} continent
 * @param {RegionID} id
 * @returns {Continent}
 */
export function add_region(continent, id) { return { ...continent, regions: [...continent.regions, id] }; }

/**
 * @param {Readonly<Continent>} continent
 * @param {RegionID} id
 * @returns {Continent}
 */
export function remove_region(continent, id) { return { ...continent, regions: continent.regions.filter(old_id => old_id === id ? id : old_id) }; }
