// engine/map/room.js
// @ts-check

import '../../utils/types.js'
import * as Opt from '../../utils/option.js'
import * as Repo from '../../utils/repository.js'

/**
 * Un seul sens
 * @typedef {Object} RoomExit
 * @property {AreaID} target_area_id
 * @property {Coord3D} target_room_coord
 */

/**@typedef {'city'|'river'|'forest'|'mountain'} RoomType */
/** @typedef {number & {__brand:"RoomID"}} RoomID*/
/**
 * @typedef {Object} Room
 * @property {RoomID} id
 * @property {Coord3D} coord // local à l'Area
 * @property {RoomType} type
 * @property {Object.<string, RoomExit>} exits // "north", "portal"
 */

/**
 * @param {D<RoomRepo>} repo
 * @param {D<Coord3D>} coord
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
    if (Object.keys(room.exits).includes(direction)) return Opt.some(room.exits[direction]);
    return Opt.none;
}
