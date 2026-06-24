// engine/map/area.js
// @ts-check

import '../../utils/types.js'
import * as Coord from './coord.js'
import * as Room from './room.js'
import * as Repo from '../../utils/repository.js'
import * as Opt from '../../utils/option.js'

/** @typedef {number & {__brand:"AreaID"}} AreaID*/
/**
 * @typedef {Object} Area
 * @property {AreaID} id
 * @property {string} name
 * @property {Object.<string, RoomID>} rooms
 */

/**
 * @param {D<AreaRepo>} repo
 * @param {string} name
 * @returns {[D<AreaRepo>, D<Area>]}
 */
export function spawn(repo, name) {
    return Repo.spawn_element(repo, {
        name,
        rooms: {}
    });
}

/**
 * @param {D<Area>} area 
 * @param {D<RoomCoord>} coord 
 * @returns {Opt<D<RoomID>>}
 */
export function get_room(area, coord) {
    const room = area.rooms[Coord.key_from_3D(coord)];
    return room ? Opt.some(room) : Opt.none;
}

/**
 * @param {D<Area>} area 
 * @param {D<RoomCoord>} coord 
 * @param {D<RoomID>} room 
 * @returns {D<Area>}
 */
export function replace_room(area, coord, room) {
    return {
        ...area,
        rooms: {
            ...area.rooms,
            [Coord.key_from_3D(coord)]: room
        }
    };
}

/**
 * @param {D<Area>} area
 * @param {D<RoomCoord>} coord
 * @param {D<RoomID>} room
 * @returns {D<Area>}
 */
export function add_room(area, coord, room) {
    return {
        ...area, rooms: {
            ...area.rooms,
            [Coord.key_from_3D(coord)]: room
        }
    };
}

/**
 * @param {D<Area>} area
 * @param {D<RoomCoord>} coord
 * @returns {D<Area>}
 */
export function remove_room(area, coord) {
    const { [Coord.key_from_3D(coord)]: _, ...xs } = area.rooms;
    return { ...area, rooms: xs };
}
/**
 * @param {D<Area>} area
 * @param {D<RoomID>} id
 * @returns {D<Area>}
 */
export function remove_room_from_id(area, id) {
    const { [id]: _, ...xs } = area.rooms;
    return { ...area, rooms: xs };
}


/**
 * TODO: crée pour l'instant mais doit pouvoir lire depuis save plus tard
 * @param {D<Area>} area 
 * @param {D<RoomCoord>} coord 
 * @param {D<RoomRepo>} repo
 * @param {RoomType} type
 * @returns {[D<RoomRepo>, D<Area>]}
 */
export function load_room(area, coord, repo, type) {
    const room_opt = get_room(area, coord);
    if (Opt.is_some(room_opt)) return [repo, area];
    const [new_repo, new_room] = Room.spawn(repo, coord, type);
    return [new_repo, add_room(area, coord, new_room.id)];
}
