// engine/core/world.js
//@ts-check

import '../../utils/types.js'
import * as Clock from './clock.js'
import * as Entity from '../entities/entity.js'
import * as Player from '../entities/player.js'
import * as Map from '../map/map.js'
import * as Area from '../map/area.js'
import * as Coord from '../map/coord.js'
import * as Movement from '../map/movement.js'
import * as Repo from '../../utils/repository.js'
import * as Opt from '../../utils/option.js'

/**
 * @typedef {Object} World
 * @property {Clock} clock
 * @property {Map3D} map
 * @property {EntityRepository} entity_repo
 */

/**
 * @returns {World}
 */
export function create() {
    let entity_repo = /**@type {EntityRepository}*/(Repo.create());
    // Player
    [entity_repo] = Entity.spawn(entity_repo, {
        continent: /**@type {ContinentID}*/(0),
        region: /**@type {RegionID}*/(0),
        area:/**@type {AreaID}*/(0),
        coord: /**@type {RoomCoord}*/({ x: 0, y: 0, z: 0 })
    },
        'NORTH');
    return {
        clock: Clock.create(null),
        map: Map.create(),
        entity_repo,
    };
}

/**
 * @param {DeepReadonly<World>} world
 * @param {number} delta_ms
 * @returns {World}
 */
export function update(world, delta_ms) {
    // TODO: update la clock aussi ? ou faire dehors je sais pas
    return { ...world };
}

/**
 * @param {DeepReadonly<World>} world
 * @param {Direction} direction
 * @returns {World}
 */
export function change_direction_player(world, direction) {
    const player = Player.get(world.entity_repo);
    return {
        ...world,
        entity_repo: {
            ...world.entity_repo,
            elements: {
                ...world.entity_repo.elements,
                [Player.ID]: Entity.change_direction(player, direction)
            }
        }
    };
}

/**
 * change seulement coord et pas continent/region/area ids
 * @param {DeepReadonly<World>} world
 * @param {Address} target
 * @returns {World}
 */
export function move_player(world, target) {
    const player = Player.get(world.entity_repo);

    let map = world.map;
    let continent = Opt.unwrap(Repo.get(world.map.continent_repo, target.continent));
    let region = Opt.unwrap(Repo.get(map.region_repo, target.region));
    let area = Opt.unwrap(Repo.get(map.area_repo, target.area));
    const room_opt = Area.get_room(area, target.coord);
    let new_world = world;
    if (Opt.is_none(room_opt)) {
        area = Area.load_room(area, target.coord);
        let area_repo = Repo.replace(map.area_repo, area.id, area);
        let region_repo = Repo.replace(map.region_repo, region.id, region);
        let continent_repo = Repo.replace(map.continent_repo, continent.id, continent);
        new_world = { ...new_world, map: { ...map, area_repo, region_repo, continent_repo } };
    }

    if (Movement.can_move(new_world, player, player.address, target)) {
        return {
            ...new_world,
            entity_repo: Repo.replace(new_world.entity_repo, Player.ID, Entity.move(player, target))
        };
    }
    return new_world;
}
