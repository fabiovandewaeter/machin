// engine/map/star_system.js
// @ts-check

/**
 * @typedef {import("./celestial_body.js").CelestialBodyID} CelestialBodyID
 */
import { repository_spawn_element } from "../../utils/repository.js";
import "../../utils/types.js"

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
export function starsystem_spawn(repo, { name }) {
    return repository_spawn_element(repo, {
        name,
        celestial_bodies: []
    });
}
