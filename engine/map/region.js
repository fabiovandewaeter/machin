// engine/map/region.js
// @ts-check

import '../../utils/types.js'
import * as Area from './area.js'
import * as Repo from '../../utils/repository.js'

/** @typedef {number & {__brand:"RegionID"}} RegionID*/
/**
 * @typedef {Object} Region
 * @property {RegionID} id
 * @property {string} name
 * @property {AreaID[]} areas
 */

/**
 * @param {DeepReadonly<Map3D>} map
 * @param {string} name
 * @returns {[Map3D, RegionID]}
 */
export function spawn(map, name) {
    let [area_repo, area] = Area.spawn(map.area_repo, "area_A");
    /** @type {Omit<Region, "id">} */
    const tempo_region = {
        name,
        areas: [area],
    };
    let [region_repo, id] = Repo.spawn_element(map.region_repo, tempo_region);
    let new_map = { ...map, region_repo, area_repo };
    return [new_map, id];
}

/**
 * @param {DeepReadonly<Region>} continent
 * @param {AreaID} id
 * @returns {Region}
 */
export function add_area(continent, id) { return { ...continent, areas: [...continent.areas, id] }; }

/**
 * @param {DeepReadonly<Region>} continent
 * @param {AreaID} id
 * @returns {Region}
 */
export function remove_area(continent, id) { return { ...continent, areas: continent.areas.filter(old_id => old_id === id ? id : old_id) }; }
