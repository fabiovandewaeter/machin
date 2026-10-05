// engine/map/celestial_body.js
// @ts-check

/**
 * @typedef {import("./region.js").RegionID} RegionID
 * @typedef {import("./atmosphere.js").Atmosphere} Atmosphere
 */
import "../../utils/types.js"
import * as Repo from "../../utils/repository.js";
import * as Opt from "../../utils/option.js";

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
export function spawn(repo, { name, atmosphere }) {
    return Repo.spawn_element(repo, {
        name,
        orbits: [],
        atmosphere: atmosphere ? Opt.some(atmosphere) : Opt.none,
        regions: [],
    });
}
