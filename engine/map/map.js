// engine/map/map.js
// @ts-check

import '../../utils/types.js'

// map > continent > region > area > room > cubes

/**
 * @typedef {Object} Map3D
 * @property {ContinentID[]} continents
 */

/**
 * @returns {Map3D}
 */
export function create() {
    return {
        continents: []
    };
}

/**
 * @param {Readonly<Map3D>} map
 * @param {ContinentID} id
 * @returns {Map3D}
 */
export function add_continent(map, id) { return { ...map, continents: [...map.continents, id] }; }

/**
 * @param {Readonly<Map3D>} map
 * @param {ContinentID} id
 * @returns {Map3D}
 */
export function remove_continent(map, id) { return { ...map, continents: map.continents.filter(old_id => old_id === id ? id : old_id) }; }
