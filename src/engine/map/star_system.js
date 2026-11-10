// engine/map/star_system.js

/**
 * @import {CelestialBodyID} from "../core/ids.types.js"
 * @import {StarSystemID} from "../core/ids.types.js"
 * @import {Repo} from "../../utils/repository.js"
 */
import { repository_spawn_element } from "../../utils/repository.js";


/**
 * @typedef {Object} StarSystem
 * @prop {StarSystemID} id
 * @prop {string} name
 * @prop {CelestialBodyID[]} celestial_bodies
 * 
 * @typedef {Repo<StarSystemID, StarSystem>} StarSystemRepo
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
