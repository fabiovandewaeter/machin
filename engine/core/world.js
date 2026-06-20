// engine/core/world.js
//@ts-check

import '../../utils/types.js'
import * as Clock from './clock.js'
import * as Map from '../map/map.js'
import * as Player from '../entities/player.js'
import * as Entity from '../entities/entity.js'
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
    [entity_repo] = Entity.spawn(entity_repo, { x: 0, y: 0, z: 0 }, 'NORTH');
    return {
        clock: Clock.create(null),
        map: Map.create(),
        entity_repo,
    };
}

/**
 * @param {Readonly<World>} world
 * @param {number} delta_ms
 * @returns {World}
 */
export function update(world, delta_ms) {
    // TODO: update la clock aussi ? ou faire dehors je sais pas
    return { ...world };
}

/**
 * @param {Readonly<World>} world
 * @param {Direction} direction
 * @returns {World}
 */
export function change_direction_player(world, direction) {
    return {
        ...world,
        entity_repo: {
            ...world.entity_repo,
            elements: {
                ...world.entity_repo.elements,
                [Player.ID]: Entity.change_direction(Player.ID, world.entity_repo, direction)
            }
        }
    };
}

/**
 * @param {Readonly<World>} world
 * @param {Coord3D} target
 * @returns {World}
 */
export function move_player(world, target) {
    return {
        ...world,
        entity_repo: {
            ...world.entity_repo,
            elements: {
                ...world.entity_repo.elements,
                [Player.ID]: Entity.move(Player.ID, world.entity_repo, target)
            }
        }
    };
}
