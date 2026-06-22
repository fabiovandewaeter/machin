// engine/map/area.js
// @ts-check

import '../../utils/types.js'
import * as Coord from './coord.js'
import * as Room from './room.js'
import * as Repo from '../../utils/repository.js'
import * as Opt from '../../utils/option.js'

/** @typedef {number & {__brand:"AareaID"}} AreaID*/
/**
 * @typedef {Object} Area
 * @property {AreaID} id
 * @property {string} name
 * @property {Object.<string, Room>} rooms
 */

/**
 * @param {DeepReadonly<AreaRepository>} repo
 * @param {string} name
 * @returns {[AreaRepository, AreaID]}
 */
export function spawn(repo, name) {
    /** @type {Omit<Area, "id">} */
    const tempo_area = {
        name,
        rooms: {}
    };
    const room = Room.create(/**@type {RoomCoord}*/({ x: 0, y: 0, z: 0 }));
    let [new_repo, id] = Repo.spawn_element(repo, tempo_area);
    let area = Opt.unwrap(Repo.get(new_repo, id));
    new_repo = Repo.replace(new_repo, area.id, add_room(area, room.coord, room));
    return [new_repo, id];
}

/**
 * @param {DeepReadonly<Area>} area
 * @param {RoomCoord} coord
 * @param {Room} room
 * @returns {Area}
 */
export function add_room(area, coord, room) {
    return {
        ...area, rooms: {
            ...area.rooms,
            [Coord.key_from_2D(coord)]: room
        }
    };
}

/**
 * @param {DeepReadonly<Area>} area
 * @param {RoomCoord} coord
 * @returns {Area}
 */
export function remove_room(area, coord) {
    const { [Coord.key_from_2D(coord)]: _, ...xs } = area.rooms;
    return { ...area, rooms: xs };
}

/**
 * @param {DeepReadonly<Area>} area 
 * @param {RoomCoord} coord 
 * @returns {import("../../utils/option.js").Opt<Room>}
 */
export function get_room(area, coord) {
    const room = area.rooms[Coord.key_from_3D(coord)];
    return room ? Opt.some(room) : Opt.none;
}

/**
 * @param {DeepReadonly<Area>} area 
 * @param {RoomCoord} coord 
 * @param {Room} room 
 * @returns {Area}
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
 * @param {DeepReadonly<Area>} area 
 * @param {RoomCoord} coord 
 * @returns {Area}
 */
export function load_room(area, coord) {
    const room_opt = get_room(area, coord);
    if (Opt.is_some(room_opt)) return area;
    const new_room = Room.create(coord);
    return add_room(area, coord, new_room);
}
