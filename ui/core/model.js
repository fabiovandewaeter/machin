// ui/core/model.js
// @ts-check

import '../../utils/types.js'
import * as World from '../../engine/core/world.js'
import * as Block from '../block/block_model.js'

// TODO: séparer les objets visibles des non visibles pour pas avoir besoin de tout parcourir à chaque fois pour vérifier si on doit update
// TODO: séparer repositories UI et engine
/**
 * @typedef {Object} Model
 * @property {Scene} scene
 * @property {string[]} logs
 * @property {number|null} tick_interval_id
 * @property {World} world
 * @property {BlockRepository} block_repo
 */

/**
 * @returns {Model}
 */
export function create() {
    return {
        scene: 'main',
        logs: [],
        tick_interval_id: null,
        world: World.create(),
        block_repo: Block.create_repo(),
    };
}

export { };
