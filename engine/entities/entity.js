// engine/entities/entity.js
// @ts-check

import * as Repo from '../../utils/repository.js'
import * as Opt from '../../utils/option.js'

/** @typedef {number & {__brand:"EntityID"}} EntityID */
/**
 * @typedef {Object} Entity
 * @property {EntityID} id
 * @property {Coord3D} coord
 * @property {Direction} direction
 */

/**
 * @param {Readonly<EntityRepository>} repo
 * @param {Coord3D} coord
 * @param {Direction} direction
 * @returns {[EntityRepository, EntityID]}
 */
export function spawn(repo, coord, direction) {
    return Repo.spawn_element(repo, {
        coord,
        direction
    });
}

/**
 * @param {EntityID} id
 * @param {Readonly<EntityRepository>} repo
 * @param {Direction} direction
 * @returns {Entity}
 */
export function change_direction(id, repo, direction) {
    const entity = Opt.unwrap(Repo.get(repo, id));
    return {
        ...entity,
        direction
    };
}

/**
 * @param {EntityID} id
 * @param {Readonly<EntityRepository>} repo
 * @param {Coord3D} target 
 * @returns {Entity}
 */
export function move(id, repo, target) {
    const entity = Opt.unwrap(Repo.get(repo, id));
    return {
        ...entity,
        // TODO: ajouter collision et autres
        coord: target
    };
}
