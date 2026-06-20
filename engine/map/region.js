// engine/map/region.js
// @ts-check

import '../../utils/types.js'
import * as Repo from '../../utils/repository.js'

/** @typedef {number & {__brand:"RegionID"}} RegionID*/
/**
 * @typedef {Object} Region
 * @property {AreaID} id
 * @property {string} name
 * @property {AreaID[]} areas
 */

/**
 * @param {Readonly<RegionRepository>} repo
 * @param {string} name
 * @returns {[RegionRepository, RegionID]}
 */
export function spawn(repo, name) {
    /** @type {Omit<Region, "id">} */
    const tempo_region = {
        name,
        areas: []
    };
    const [new_repo, id] = Repo.spawn_element(repo, tempo_region);
    return [new_repo, id];
}

/**
 * @param {Readonly<Region>} continent
 * @param {AreaID} id
 * @returns {Region}
 */
export function add_area(continent, id) { return { ...continent, areas: [...continent.areas, id] }; }

/**
 * @param {Readonly<Region>} continent
 * @param {AreaID} id
 * @returns {Region}
 */
export function remove_area(continent, id) { return { ...continent, areas: continent.areas.filter(old_id => old_id === id ? id : old_id) }; }
