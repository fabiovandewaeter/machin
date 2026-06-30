// ui/core/model.js
// @ts-check

import '../../utils/types.js'
import * as World from '../../engine/core/world.js'
import * as Save from '../../utils/save.js'
import * as Opt from '../../utils/option.js'
import * as Clock from '../../engine/core/clock.js'

// TODO: séparer les objets visibles des non visibles pour pas avoir besoin de tout parcourir à chaque fois pour vérifier si on doit update
// TODO: séparer repositories UI et engine
/**
 * @typedef {Object} Model
 * @property {Scene} scene
 * @property {string[]} logs
 * @property {number|null} tick_interval_id
 * @property {World} world
 * @property {boolean} is_initialized
 */

/**
 * @returns {D<Model>}
 */
export function create() {
    const saved_opt = Save.load();

    if (Opt.is_some(saved_opt)) {
        let model = saved_opt.value;
        const now = Date.now();
        const delta = now - model.world.clock.last_tick_timestamp;
        if (delta > 0) {
            model.world.clock = Clock.advance_clock_by(model.world.clock, delta);
            model.world = /**@type {World}*/(World.update({ ...model.world, clock: model.world.clock }, delta));
        }
        model.world.clock.last_tick_timestamp = now;

        return model;
    }
    return {
        scene: 'main',
        logs: [],
        tick_interval_id: null,
        world: World.create(),
        is_initialized: false
    };
}

/**
 * @param {D<Model>} model 
 * @returns {D<Model>}
 */
export function init(model) {
    return {
        ...model,
        world: World.init(model.world)
    }
}
