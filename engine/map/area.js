// engine/map/area.js
// @ts-check

/**
 * @typedef {import("./room.js").RoomID} RoomID
 */
import { repository_spawn_element } from "../../utils/repository.js";
import "../../utils/types.js"


/**
 * @typedef {Object} Area
 * @property {AreaID} id
 * @property {string} name
 * @property {RoomID[]} rooms
 * 
 * @typedef {number & {readonly __brand:"AreaID"}} AreaID
 * @typedef {import("../../utils/repository.js").Repo<AreaID, Area>} AreaRepo
 */

/**
 * @param {AreaRepo} repo
 * @param {Object} options
 * @param {string} options.name
 * @returns {Area}
 */
export function area_spawn(repo, { name }) {
    return repository_spawn_element(repo, {
        name,
        rooms: []
    });
}
