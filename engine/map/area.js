// engine/map/area.js

/**
 * @typedef {import("../core/ids.types.js").RoomID} RoomID
 * @typedef {import("../core/ids.types.js").AreaID} AreaID
 */
import { repository_spawn_element } from "../../utils/repository.js";


/**
 * @typedef {Object} Area
 * @property {AreaID} id
 * @property {string} name
 * @property {RoomID[]} rooms
 * 
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
