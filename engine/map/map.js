// engine/map/map.js
// @ts-check

import '../../utils/types.js'
import * as Continent from './continent.js'
import * as Repo from '../../utils/repository.js'

// map > continent > region > area > room > cubes

/**
 * @typedef {Object} Map3D
 * @property {ContinentID[]} continents
 * @property {ContinentRepository} continent_repo
 * @property {RegionRepository} region_repo
 * @property {AreaRepository} area_repo
 */

/**
 * @returns {Map3D}
 */
export function create() {
    /**@type {Map3D} */
    let map_tempo = {
        continents: [],
        continent_repo: /**@type {ContinentRepository}*/(Repo.create()),
        region_repo: /**@type {RegionRepository}*/(Repo.create()),
        area_repo: /**@type {AreaRepository}*/(Repo.create())
    };
    let [map, continent] = Continent.spawn(map_tempo, "continent_A");
    return {
        ...map_tempo,
        continents: [continent],
        continent_repo,
    };
}

/**
 * @param {DeepReadonly<Map3D>} map
 * @param {ContinentID} id
 * @returns {Map3D}
 */
export function add_continent(map, id) { return { ...map, continents: [...map.continents, id] }; }

/**
 * @param {DeepReadonly<Map3D>} map
 * @param {ContinentID} id
 * @returns {Map3D}
 */
export function remove_continent(map, id) { return { ...map, continents: map.continents.filter(old_id => old_id === id ? id : old_id) }; }
