// engine/map/area.js

/**
 * @import {RoomID} from "../core/ids.types.js"
 * @import {AreaID} from "../core/ids.types.js"
 * @import {Repo} from "../../utils/repository.js"
 */
import { repository_spawn_element } from "../../utils/repository.js";

/**
 * @typedef {Object} Area
 * @prop {AreaID} id
 * @prop {string} name
 * @prop {RoomID[]} rooms
 * 
 * @typedef {Repo<AreaID, Area>} AreaRepo
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
