// engine/map/region.js

/**
 * @import {AreaID} from "../core/ids.types.js"
 * @import {RegionID} from "../core/ids.types.js"
 * @import {Repo} from "../../utils/repository.js"
 */
import { repository_spawn_element } from "../../utils/repository.js";


/**
 * @typedef {Object} Region
 * @prop {RegionID} id
 * @prop {string} name
 * @prop {AreaID[]} areas
 * 
 * @typedef {Repo<RegionID, Region>} RegionRepo
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
