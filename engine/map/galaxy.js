// engine/galaxy/galaxy.js

/**
 * @typedef {import("../core/ids.types.js").StarSystemID} StarSystemID
 * @typedef {import("./star_system.js").StarSystemRepo} StarSystemRepo
 * @typedef {import("../core/ids.types.js").CelestialBodyID} CelestialBodyID
 * @typedef {import("./celestial_body.js").CelestialBodyRepo} CelestialBodyRepo
 * @typedef {import("../core/ids.types.js").RegionID} RegionID
 * @typedef {import("./region.js").RegionRepo} RegionRepo
 * @typedef {import("../core/ids.types.js").AreaID} AreaID
 * @typedef {import("./area.js").AreaRepo} AreaRepo
 * @typedef {import("../core/ids.types.js").RoomID} RoomID
 * @typedef {import("./room/room.js").RoomRepo} RoomRepo
 */
import { repository_create } from "../../utils/repository.js";
import { ore_generate } from "../extraction/ore.js";

import { room_add_exit, room_spawn } from "./room/room.js";

// Galaxy > StarStarSystem > CelestialBody > Region > Area > Room

export const GALAXY_DEFAULT_ROOM_ID = /**@type {RoomID} */ (0);

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
export function galaxy_create() {
    return {
        star_systems: [],
        star_system_repo: repository_create(),
        celestial_body_repo: repository_create(),
        region_repo: repository_create(),
        area_repo: repository_create(),
        room_repo: repository_create(),
    };
}

/**
 * @param {Galaxy} galaxy 
 */
export function galaxy_init(galaxy) {
    const default_room = room_spawn(galaxy.room_repo, {
        kind: "CITY",
        name: "default",
        layer: 0,
        content: ore_generate(5),
    });
    // TODO: enlever ça faire une système plus propre
    if (default_room.id != GALAXY_DEFAULT_ROOM_ID) throw new Error(`default_room_id different from DEFAULT_ROOM_ID: ${default_room.id} ${GALAXY_DEFAULT_ROOM_ID}`)
    const seconde_room = room_spawn(galaxy.room_repo, {
        kind: "FOREST",
        name: "seconde_room",
        layer: 0,
        content: ore_generate(5),
    });
    room_add_exit(galaxy.room_repo, default_room.id, "sortie foret", {
        target_id: seconde_room.id
    });
    room_add_exit(galaxy.room_repo, seconde_room.id, "room default", {
        target_id: default_room.id
    });
}
