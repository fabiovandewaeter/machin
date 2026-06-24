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
 * @param {D<EntityRepo>} repo
 * @param {D<Address>} address
 * @param {D<Direction>} direction
 * @returns {[D<EntityRepo>, D<Entity>]}
 */
export function spawn(repo, address, direction) {
    return Repo.spawn_element(repo, {
        address,
        direction
    });
}

/**
 * @param {D<Entity>} entity
 * @param {D<Direction>} direction
 * @returns {D<Entity>}
 */
export function change_direction(entity, direction) { return { ...entity, direction }; }

/**
 * @param {D<Entity>} entity
 * @param {D<Address>} address
 * @returns {D<Entity>}
 */
export function move(entity, address) { return { ...entity, address }; }
