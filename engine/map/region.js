// engine/map/region.js
// @ts-check

/**
 * @typedef {import("./area.js").AreaID} AreaID
 */
import "../../utils/types.js"
import * as Repo from "../../utils/repository.js";

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
export function spawn(repo, { name }) {
    return Repo.spawn_element(repo, {
        name,
        areas: []
    });
}
