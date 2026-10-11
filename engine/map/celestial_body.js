// engine/map/celestial_body.js

/**
 * @typedef {import("../core/ids.types.js").RegionID} RegionID
 * @typedef {import("../core/ids.types.js").CelestialBodyID} CelestialBodyID
 * @typedef {import("./atmosphere.js").Atmosphere} Atmosphere
 */
/** @template T @typedef {import("../../utils/option.js").Opt<T>} Opt */
import { none, some } from "../../utils/option.js";
import { repository_spawn_element } from "../../utils/repository.js";


/**
 * @typedef {Object} CelestialBody
 * @property {CelestialBodyID} id
 * @property {string} name
 * @property {CelestialBodyID[]} orbits
 * @property {Opt<Atmosphere>} atmosphere
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
        atmosphere: atmosphere ? some(atmosphere) : none,
        regions: [],
    });
}
