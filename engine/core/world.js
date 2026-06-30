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
import * as Res from '../../utils/result.js'

/**
 * @typedef {Object} World
 * @property {Clock} clock
 * @property {Map3D} map
 * @property {EntityRepo} entity_repo
 */

/**
 * @returns {D<World>}
 */
export function create() {
    return {
        clock: Clock.create(null),
        map: Map.create(),
        entity_repo: Repo.create(),
    };
}

/**
 * @param {D<World>} world 
 * @returns {D<World>}
 */
export function init(world) {
    // Player
    let [entity_repo] = Entity.spawn(world.entity_repo, {
        continent: /**@type {ContinentID}*/(0),
        region: /**@type {RegionID}*/(0),
        area:/**@type {AreaID}*/(0),
        coord: { x: 0, y: 0, z: 0 }
    },
        'NORTH');
    // Map
    let map = Map.init(world.map);
    return {
        ...world,
        entity_repo,
        map
    };
}

/**
 * @param {D<World>} world
 * @param {number} delta_ms
 * @returns {D<World>}
 */
export function update(world, delta_ms) {
    // TODO: update la clock aussi ? ou faire dehors je sais pas
    return { ...world };
}

/**
 * @param {D<World>} world
 * @param {D<Direction>} direction
 * @returns {D<World>}
 */
export function change_direction_player(world, direction) {
    const player = Player.get(world.entity_repo);
    return {
        ...world,
        // entity_repo: {
        //     ...world.entity_repo,
        //     elements: {
        //         ...world.entity_repo.elements,
        //         [Player.ID]: Entity.change_direction(player, direction)
        //     }
        // }
        entity_repo: Repo.replace(world.entity_repo, Entity.change_direction(player, direction))
    };
}

/**
 * change seulement coord et pas continent/region/area ids
 * @param {D<World>} world
 * @param {D<Address>} target
 * @returns {Res<D<World>, string>}
 */
export function move_player(world, target) {
    const player = Player.get(world.entity_repo);

    const can_move_res = Movement.can_move(world, player, player.address, target);
    if (Res.is_err(can_move_res)) return can_move_res;

    return Res.ok({
        ...world,
        entity_repo: Repo.replace(world.entity_repo, Entity.move(player, target))
    });
}
