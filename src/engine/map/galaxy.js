// engine/map/galaxy.js

/**
 * @import {StarSystemID} from "../core/ids.types.js"
 * @import {StarSystemRepo} from "./star_system.js"
 * @import {CelestialBodyRepo} from "./celestial_body.js"
 * @import {RegionRepo} from "./region.js"
 * @import {AreaRepo} from "./area.js"
 * @import {RoomID} from "../core/ids.types.js"
 * @import {RoomRepo} from "./room/room.types.js"
 * @import {RandomGenerator} from "../../utils/random_generator.js"
 */
import { assert } from "../../utils/assert.js";
import { repository_create } from "../../utils/repository.js";
import { ore_generate } from "../extraction/ore.js";
import { enginesignals_batch } from "../core/signal/signal.js";


import { room_add_exit, room_spawn } from "./room/room.js";

// Galaxy > StarStarSystem > CelestialBody > Region > Area > Room

export const GALAXY_DEFAULT_ROOM_ID = /**@type {RoomID} */ (0);

/**
 * @typedef {Object} Galaxy
 * @prop {StarSystemID[]} star_systems
 * @prop {StarSystemRepo} star_system_repo
 * @prop {CelestialBodyRepo} celestial_body_repo
 * @prop {RegionRepo}  region_repo
 * @prop {AreaRepo}  area_repo
 * @prop {RoomRepo} room_repo
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
 * @param {RandomGenerator} random_generator
 */
export function galaxy_init(galaxy, random_generator) {
    enginesignals_batch(() => {
        const default_room = room_spawn(galaxy.room_repo, {
            kind: "CITY",
            name: "default",
            layer: 0,
            content: ore_generate(random_generator, 5),
        });
        // TODO: enlever ça faire une système plus propre
        assert(default_room.id == GALAXY_DEFAULT_ROOM_ID,
            `default_room_id different from DEFAULT_ROOM_ID: ${default_room.id} ${GALAXY_DEFAULT_ROOM_ID}`);
        const seconde_room = room_spawn(galaxy.room_repo, {
            kind: "FOREST",
            name: "seconde_room",
            layer: 0,
            content: ore_generate(random_generator, 5),
        });
        room_add_exit(galaxy.room_repo, default_room.id, "sortie foret", {
            target_id: seconde_room.id
        });
        room_add_exit(galaxy.room_repo, seconde_room.id, "room default", {
            target_id: default_room.id
        });
    });
}
