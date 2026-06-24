// engine/map/map.js
// @ts-check

import '../../utils/types.js'
import * as Room from './room.js'
import * as Area from './area.js'
import * as Continent from './continent.js'
import * as Region from './region.js'
import * as Address from './address.js'
import * as Repo from '../../utils/repository.js'
import * as Opt from '../../utils/option.js';
import * as Res from '../../utils/result.js';

// map > continent > region > area > room > cubes

/**
 * @typedef {Object} Map3D
 * @property {ContinentID[]} continents
 * @property {ContinentRepo} continent_repo
 * @property {RegionRepo} region_repo
 * @property {AreaRepo} area_repo
 * @property {RoomRepo} room_repo
 */

/**
 * @returns {D<Map3D>}
 */
export function create() {
    // let [map, continent] = Continent.spawn(map_tempo, "continent_A");
    return {
        continents: [],
        continent_repo: Repo.create(),
        region_repo: Repo.create(),
        area_repo: Repo.create(),
        room_repo: Repo.create()
    };
}

/**
 * @param {D<Map3D>} map 
 */
export function init(map) {
    let [_, area] = Area.spawn(map.area_repo, "area_A");
    const coords = [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
        { x: 0, y: 0, z: 1 },
        { x: -1, y: 0, z: 0 },
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 0, z: -1 },
    ];
    let new_map = spawn_rooms(map, area, /**@type {RoomCoord[]}*/(coords));

    let [region_repo, region] = Region.spawn(new_map.region_repo, "region_A");
    let [continent_repo, continent] = Continent.spawn(new_map.continent_repo, "continent_A");

    return {
        ...add_continent(new_map, continent.id),
        continent_repo: Repo.replace(continent_repo, Continent.add_region(continent, region.id)),
        region_repo: Repo.replace(region_repo, Region.add_area(region, area.id)),
    }
}

/**
 * @param {D<Map3D>} map 
 * @param {D<Area>} area 
 * @param {RoomCoord[]} coords 
 * @returns {D<Map3D>}
 */
export function spawn_rooms(map, area, coords) {
    // const res =
    //     coords.reduce((acc, curr) => {
    //         let [room_repo, room] = Room.spawn(acc.room_repo, curr, "forest");
    //         let area = Area.add_room(acc.area, room.coord, room.id);
    //         let area_repo = Repo.replace(acc.area_repo, area);
    //         return { room_repo, room, area_repo, area };
    //     }, { room_repo: map.room_repo, area_repo: map.area_repo, area });
    // return {
    //     ...map,
    //     area_repo: res.area_repo,
    //     room_repo: res.room_repo
    // }
    let current_room_repo = map.room_repo;
    let current_area = area;

    for (const coord of coords) {
        const [new_room_repo, room] = Room.spawn(current_room_repo, coord, "forest");
        current_area = Area.add_room(current_area, room.coord, room.id);
        current_room_repo = new_room_repo;
    }

    return {
        ...map,
        area_repo: Repo.replace(map.area_repo, current_area),
        room_repo: current_room_repo
    }
}

/**
 * @param {D<Map3D>} map
 * @param {ContinentID} id
 * @returns {D<Map3D>}
 */
export function add_continent(map, id) { return { ...map, continents: [...map.continents, id] }; }

/**
 * @param {D<Map3D>} map
 * @param {ContinentID} id
 * @returns {D<Map3D>}
 */
export function remove_continent(map, id) { return { ...map, continents: map.continents.filter(old_id => old_id === id ? id : old_id) }; }
