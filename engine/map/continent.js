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
 * @param {DeepReadonly<Map3D>} map
 * @param {string} name
 * @returns {[Map3D, ContinentID]}
 */
export function spawn(map, name) {
    let [new_map, region] = Region.spawn(map, "region_A");
    /** @type {Omit<Continent, "id">} */
    const tempo_continent = {
        name,
        regions: [region],
    };
    let [continent_repo, id] = Repo.spawn_element(map.continent_repo, tempo_continent);
    new_map = { ...map, continent_repo };
    return [new_map, id];
}

/**
 * @param {DeepReadonly<Continent>} continent
 * @param {RegionID} id
 * @returns {Continent}
 */
export function add_region(continent, id) { return { ...continent, regions: [...continent.regions, id] }; }

/**
 * @param {DeepReadonly<Continent>} continent
 * @param {RegionID} id
 * @returns {Continent}
 */
export function remove_region(continent, id) { return { ...continent, regions: continent.regions.filter(old_id => old_id === id ? id : old_id) }; }
