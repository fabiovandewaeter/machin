// engine/map/address.js
// @ts-check

import * as Coord from './coord.js'

/**
 * @typedef {Object} Address
 * @property {ContinentID} continent
 * @property {RegionID} region
 * @property {AreaID} area
 * @property {RoomCoord} coord
 */

/**
 * @param {Address} address
 * @returns {string}
 */
export function to_string(address) { return `{continent: ${address.continent}, region: ${address.region}, area: ${address.area}, coord: ${Coord.to_string3D(address.coord)}}`; }
