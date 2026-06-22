// engine/entities/entity.js
// @ts-check

import * as Repo from '../../utils/repository.js'

/** @typedef {number & {__brand:"EntityID"}} EntityID */
/**
 * @typedef {Object} Entity
 * @property {EntityID} id
 * @property {Address} address
 * @property {Direction} direction
 */

/**
 * @param {DeepReadonly<EntityRepository>} repo
 * @param {Address} address
 * @param {Direction} direction
 * @returns {[EntityRepository, EntityID]}
 */
export function spawn(repo, address, direction) {
    return Repo.spawn_element(repo, {
        address,
        direction
    });
}

/**
 * @param {DeepReadonly<Entity>} entity
 * @param {Direction} direction
 * @returns {Entity}
 */
export function change_direction(entity, direction) { return { ...entity, direction }; }

//  * @param {EntityID} id
//  * @param {DeepReadonly<EntityRepository>} repo
/**
 * @param {DeepReadonly<Entity>} entity
 * @param {Address} address
 * @returns {Entity}
 */
export function move(entity, address) { return { ...entity, address }; }
