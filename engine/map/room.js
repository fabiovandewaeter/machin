// engine/map/room.js
// @ts-check

import '../../utils/types.js'
import * as Opt from '../../utils/option.js'

/**
 * Un seul sens
 * @typedef {Object} RoomExit
 * @property {AreaID} target_area_id
 * @property {RoomCoord} target_room_coord
 */

/** @typedef {Coord3D & {__brand:"RoomCoord"}} RoomCoord */
/**
 * @typedef {Object} Room
 * @property {RoomCoord} coord // local à l'Area
 * @property {Object.<string, RoomExit>} exits // "north", "portal"
 */

/**
 * @param {RoomCoord} coord
 * @returns {Room}
 */
export function create(coord) {
    return {
        coord,
        exits: {}
    };
}

/**
 * @param {DeepReadonly<Room>} room 
 * @param {Direction} direction 
 * @returns {import('../../utils/option.js').Opt<RoomExit>}
 */
export function get_exit_from_direction(room, direction) {
    if (direction in room.exits.keys) return Opt.some(room.exits[direction]);
    return Opt.none;
}
