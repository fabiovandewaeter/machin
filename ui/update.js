// @ts-check
// ui/update.js

import { advance_clock_by, tick } from '../engine/core/clock_service.js';
import { update_world } from '../engine/core/world_service.js';
import { dispatch } from './runtime.js';
import './types.js';

/**
 * @param {Readonly<Model>} model
 * @param {Msg} msg
 * @returns {Model} 
 */
export function update(model, msg) {
    // TODO: si logs deviennent trop gros faut sauvegarder dans fichier externe ou faire buffer circulaire + voir dans render_logs en bas la partie qui enlève les anciens de l'affichage
    switch (msg.type) {
        case 'skip_seconds': {
            const clock = advance_clock_by(model.world.clock, msg.amount);
            let world = { ...model.world, clock };
            world = update_world(world, msg.amount);
            // save_timestamp(clock.timestamp);
            return {
                ...model,
                world,
                logs: [...model.logs, `${msg.type}: ${msg.amount * 1000} ms`]
            }
        }
        case 'tick': {
            const [clock, delta_ms] = tick(model.world.clock);
            let world = { ...model.world, clock };
            world = update_world(world, delta_ms);
            // save_timestamp(clock.timestamp);
            return {
                ...model,
                world,
                logs: [...model.logs, `${msg.type}: ${delta_ms} ms`]
            }
        }
        case 'start_stop_tick_interval': {
            let tick_interval_id = model.tick_interval_id;
            if (tick_interval_id !== null) {
                clearInterval(tick_interval_id);
                tick_interval_id = null;
            }
            else {
                tick_interval_id = setInterval(() => {
                    dispatch({ type: 'tick' });
                }, 1000);
            }

            return {
                ...model,
                tick_interval_id,
                logs: [...model.logs, `${msg.type}`]
            }
        }
    }
}

export { };
