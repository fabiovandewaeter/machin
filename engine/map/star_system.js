// engine/map/star_system.js
// @ts-check

/**
 * @typedef {import("./celestial_body.js").CelestialBodyID} CelestialBodyID
 */
import "../../utils/types.js"
import * as Repo from "../../utils/repository.js";

/**
 * @typedef {Object} StarSystem
 * @property {StarSystemID} id
 * @property {string} name
 * @property {CelestialBodyID[]} celestial_bodies
 * 
 * @typedef {number & {readonly __brand:"StarSystemID"}} StarSystemID
 * @typedef {import("../../utils/repository.js").Repo<StarSystemID, StarSystem>} StarSystemRepo
 */

/**
 * @param {StarSystemRepo} repo
 * @param {Object} options
 * @param {string} options.name
 * @returns {StarSystem}
 */
export function spawn(repo, { name }) {
    return Repo.spawn_element(repo, {
        name,
        celestial_bodies: []
    });
}
