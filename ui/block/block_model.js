// ui/block/block_model.js
// @ts-check

import '../../utils/types.js'
import * as Repo from '../../utils/repository.js'

/**
 * @typedef {number & {__brand:"BlockID"}} BlockID
 * 
 * @typedef {Object} Block
 * @property {BlockID} id
 * @property {{id: BlockID, port: number}[]} links
 * @property {Coord2D} coord
 */

/**
 * @returns {BlockRepository}
 */
export function create_repo() { return { current_id: /**@type {BlockID}*/(0), elements: {} }; }

/**
 * @param {Readonly<BlockRepository>} repo
 * @param {Coord2D} coord
 * @returns {[BlockRepository, BlockID]}
 */
export function spawn(repo, coord) {
    return Repo.spawn_element(repo, {
        links: [],
        coord
    });
}

/**
 * @param {Readonly<BlockRepository>} repo
 * @param {BlockID} id
 * @param {Coord2D} coord
 * @returns {BlockRepository}
 */
export function move(repo, id, coord) {
    return {
        ...repo,
        [id]: { ...repo.elements[id], coord }
    };
}
