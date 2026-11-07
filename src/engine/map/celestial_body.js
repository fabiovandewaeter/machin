// engine/map/celestial_body.js

/**
 * @typedef {import("../core/ids.types.js").RegionID} RegionID
 * @typedef {import("../core/ids.types.js").CelestialBodyID} CelestialBodyID
 * @typedef {import("./atmosphere.js").Atmosphere} Atmosphere
 */
import { repository_spawn_element } from "../../utils/repository.js";

/**
 * @typedef {Object} CelestialBody
 * @property {CelestialBodyID} id
 * @property {string} name
 * @property {CelestialBodyID[]} orbits
 * @property {Atmosphere|undefined} atmosphere
 * @property {RegionID[]} regions
 * 
 * @typedef {import("../../utils/repository.js").Repo<CelestialBodyID, CelestialBody>} CelestialBodyRepo
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
