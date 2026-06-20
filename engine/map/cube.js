// engine/map/cube.js
// @ts-check

import '../../utils/types.js'

/**
 * @typedef {Object} Cube
 * @property {Coord3D} coord // local au chunk
 */

/**
 * @param {Coord3D} coord 
 * @returns {Cube}
 */
export function create(coord) { return { coord }; }
