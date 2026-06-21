// engine/map/room.js
// @ts-check

import '../../utils/types.js'


/**
 * Un seul sens
 * @typedef {Object} RoomExit
 * @property {AreaID} target_area_id
 * @property {RoomCoord} target_room_coord
 */

/** @typedef {Coord2D & {__brand:"RoomCoord"}} RoomCoord */
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
 * exit from direction
 * @param {Readonly<Room>} room 
 * @param {Direction} direction 
 */
export function get_exit(room, direction) {

}
