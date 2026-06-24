// engine/map/room.js
// @ts-check

import '../../utils/types.js'
import * as Opt from '../../utils/option.js'
import * as Repo from '../../utils/repository.js'

/**
 * Un seul sens
 * @typedef {Object} RoomExit
 * @property {AreaID} target_area_id
 * @property {RoomCoord} target_room_coord
 */

/**@typedef {'city'|'river'|'forest'|'mountain'} RoomType */
/** @typedef {number & {__brand:"RoomID"}} RoomID*/
/** @typedef {Coord3D & {__brand:"RoomCoord"}} RoomCoord */
/**
 * @typedef {Object} Room
 * @property {RoomID} id
 * @property {RoomCoord} coord // local à l'Area
 * @property {RoomType} type
 * @property {Object.<string, RoomExit>} exits // "north", "portal"
 */

/**
 * @param {D<RoomRepo>} repo
 * @param {D<RoomCoord>} coord
 * @param {RoomType} type
 * @returns {[D<RoomRepo>, D<Room>]}
 */
export function spawn(repo, coord, type) {
    return Repo.spawn_element(repo, {
        coord,
        type,
        exits: {}
    });
}

/**
 * @param {D<Room>} room 
 * @param {D<Direction>} direction 
 * @returns {Opt<D<RoomExit>>}
 */
export function get_exit_from_direction(room, direction) {
    if (direction in room.exits.keys) return Opt.some(room.exits[direction]);
    return Opt.none;
}
