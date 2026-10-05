// engine/galaxy/galaxy.js
// @ts-check

/**
 * @typedef {import("./star_system.js").StarSystemID} StarSystemID
 * @typedef {import("./star_system.js").StarSystemRepo} StarSystemRepo
 * @typedef {import("./celestial_body.js").CelestialBodyID} CelestialBodyID
 * @typedef {import("./celestial_body.js").CelestialBodyRepo} CelestialBodyRepo
 * @typedef {import("./region.js").RegionID} RegionID
 * @typedef {import("./region.js").RegionRepo} RegionRepo
 * @typedef {import("./area.js").AreaID} AreaID
 * @typedef {import("./area.js").AreaRepo} AreaRepo
 * @typedef {import("./room.js").RoomID} RoomID
 * @typedef {import("./room.js").RoomRepo} RoomRepo
 */
import "../../utils/types.js"
import * as Room from "./room.js";
import * as Repo from "../../utils/repository.js";

// Galaxy > StarStarSystem > CelestialBody > Region > Area > Room

export const DEFAULT_ROOM_ID = /**@type {RoomID} */ (0);

/**
 * @typedef {Object} Galaxy
 * @property {StarSystemID[]} star_systems
 * @property {StarSystemRepo} star_system_repo
 * @property {CelestialBodyRepo} celestial_body_repo
 * @property {RegionRepo}  region_repo
 * @property {AreaRepo}  area_repo
 * @property {RoomRepo} room_repo
 */

/**
 * @returns {Galaxy}
 */
export function create() {
    return {
        star_systems: [],
        star_system_repo: Repo.create(),
        celestial_body_repo: Repo.create(),
        region_repo: Repo.create(),
        area_repo: Repo.create(),
        room_repo: Repo.create(),
    };
}

/**
 * @param {Galaxy} galaxy 
 */
export function init(galaxy) {
    const default_room = Room.spawn(galaxy.room_repo, {
        kind: "CITY",
        name: "default",
        layer: 0,
    });
    // TODO: enlever ça faire une système plus propre
    if (default_room.id != DEFAULT_ROOM_ID) throw new Error(`default_room_id different from DEFAULT_ROOM_ID: ${default_room.id} ${DEFAULT_ROOM_ID}`)
    const seconde_room = Room.spawn(galaxy.room_repo, {
        kind: "FOREST",
        name: "seconde_room",
        layer: 0,
    });
    Room.add_exit(galaxy.room_repo, default_room.id, "sortie foret", {
        target_id: seconde_room.id
    });
    Room.add_exit(galaxy.room_repo, seconde_room.id, "room default", {
        target_id: default_room.id
    });
}
