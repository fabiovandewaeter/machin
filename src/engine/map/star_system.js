// engine/map/star_system.js

/**
 * @typedef {import("../core/ids.types.js").CelestialBodyID} CelestialBodyID
 * @typedef {import("../core/ids.types.js").StarSystemID} StarSystemID
 */
import { repository_spawn_element } from "../../utils/repository.js";


/**
 * @typedef {Object} StarSystem
 * @property {StarSystemID} id
 * @property {string} name
 * @property {CelestialBodyID[]} celestial_bodies
 * 
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
