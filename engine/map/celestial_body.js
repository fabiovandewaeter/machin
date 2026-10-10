// engine/map/celestial_body.js
// @ts-check

/**
 * @typedef {import("./region.js").RegionID} RegionID
 * @typedef {import("./atmosphere.js").Atmosphere} Atmosphere
 */
import { none, some } from "../../utils/option.js";
import { repository_spawn_element } from "../../utils/repository.js";
import "../../utils/types.js"



/**
 * @typedef {Object} CelestialBody
 * @property {CelestialBodyID} id
 * @property {string} name
 * @property {CelestialBodyID[]} orbits
 * @property {Opt<Atmosphere>} atmosphere
 * @property {RegionID[]} regions
 * 
 * @typedef {number & {readonly __brand:"CelestialBody"}} CelestialBodyID
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
