// engine/map/area.js
// @ts-check

import '../../utils/types.js'
import * as Coord from './coord.js'
import * as Repo from '../../utils/repository.js'

/** @typedef {number & {__brand:"AareaID"}} AreaID*/
/**
 * @typedef {Object} Area
 * @property {AreaID} id
 * @property {string} name
 * @property {Object.<string, Room>} rooms
 */

/**
 * @param {Readonly<AreaRepository>} repo
 * @param {string} name
 * @returns {[AreaRepository, AreaID]}
 */
export function spawn(repo, name) {
    /** @type {Omit<Area, "id">} */
    const tempo_area = {
        name,
        rooms: {}
    };
    const [new_repo, id] = Repo.spawn_element(repo, tempo_area);
    return [new_repo, id];
}

/**
 * @param {Readonly<Area>} area
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
 * @param {Readonly<Area>} area
 * @param {RoomCoord} coord
 * @returns {Area}
 */
export function remove_room(area, coord) {
    const { [Coord.key_from_2D(coord)]: _, ...xs } = area.rooms;
    return { ...area, rooms: xs };
}
