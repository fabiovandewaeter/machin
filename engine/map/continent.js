// engine/map/continent.js
// @ts-check

import '../../utils/types.js'
import * as Region from './region.js'
import * as Repo from '../../utils/repository.js'

/** @typedef {number & {__brand:"ContinentID"}} ContinentID*/
/**
 * @typedef {Object} Continent
 * @property {ContinentID} id
 * @property {string} name
 * @property {RegionID[]} regions
 */

/**
 * @param {D<ContinentRepo>} repo
 * @param {string} name
 * @returns {[D<ContinentRepo>, D<Continent>]}
 */
export function spawn(repo, name) {
    return Repo.spawn_element(/**@type {ContinentRepo}*/(repo), {
        name,
        regions: []
    });
}

/**
 * @param {D<Continent>} continent
 * @param {RegionID} id
 * @returns {D<Continent>}
 */
export function add_region(continent, id) { return { ...continent, regions: [...continent.regions, id] }; }

/**
 * @param {D<Continent>} continent
 * @param {RegionID} id
 * @returns {D<Continent>}
 */
export function remove_region(continent, id) { return { ...continent, regions: continent.regions.filter(old_id => old_id === id ? id : old_id) }; }
