// engine/map/region.js

/**
 * @typedef {import("../core/ids.types.js").AreaID} AreaID
 * @typedef {import("../core/ids.types.js").RegionID} RegionID
 */
import { repository_spawn_element } from "../../utils/repository.js";


/**
 * @typedef {Object} Region
 * @property {RegionID} id
 * @property {string} name
 * @property {AreaID[]} areas
 * 
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
