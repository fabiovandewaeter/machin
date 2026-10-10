// engine/map/region.js
// @ts-check

/**
 * @typedef {import("./area.js").AreaID} AreaID
 */
import { repository_spawn_element } from "../../utils/repository.js";
import "../../utils/types.js"


/**
 * @typedef {Object} Region
 * @property {RegionID} id
 * @property {string} name
 * @property {AreaID[]} areas
 * 
 * @typedef {number & {readonly __brand:"RegionID"}} RegionID
 * @typedef {import("../../utils/repository.js").Repo<RegionID, Region>} RegionRepo
 */

/**
 * @param {RegionRepo} repo
 * @param {Object} options
 * @param {string} options.name
 * @returns {Region}
 */
export function region_spawn(repo, { name }) {
    return repository_spawn_element(repo, {
        name,
        areas: []
    });
}
