// engine/map/celestial_body.js

/**
 * @import {RegionID} from "../core/ids.types.js"
 * @import {CelestialBodyID} from "../core/ids.types.js"
 * @import {Atmosphere} from "./atmosphere.js"
 * @import {Repo} from "../../utils/repository.js"
 */
import { repository_spawn_element } from "../../utils/repository.js";

/**
 * @typedef {Object} CelestialBody
 * @prop {CelestialBodyID} id
 * @prop {string} name
 * @prop {CelestialBodyID[]} orbits
 * @prop {Atmosphere|undefined} atmosphere
 * @prop {RegionID[]} regions
 * 
 * @typedef {Repo<CelestialBodyID, CelestialBody>} CelestialBodyRepo
 */

/**
 * @param {CelestialBodyRepo} repo
 * @param {Object} options
 * @param {string} options.name
 * @param {Atmosphere} [options.atmosphere]
 * @returns {CelestialBody}
 */
export function celestialbody_spawn(repo, { name, atmosphere }) {
    return repository_spawn_element(repo, {
        name,
        orbits: [],
        atmosphere: atmosphere ? atmosphere : undefined,
        regions: [],
    });
}
