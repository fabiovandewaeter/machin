// engine/map/area.js
// @ts-check

/**
 * @typedef {import("./room.js").RoomID} RoomID
 */
import "../../utils/types.js"
import * as Repo from "../../utils/repository.js";

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
export function spawn(repo, { name }) {
    return Repo.spawn_element(repo, {
        name,
        rooms: []
    });
}
