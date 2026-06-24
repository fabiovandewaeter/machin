// ui/core/update.js
// @ts-check

import '../../utils/types.js'
import { advance_clock_by, tick } from '../../engine/core/clock.js'
import { dispatch } from './runtime.js'
import * as World from '../../engine/core/world.js'
import * as Coord from '../../engine/map/coord.js'
import * as Address from '../../engine/map/address.js'
import * as Player from '../../engine/entities/player.js'
import * as Res from '../../utils/result.js'

const TICK_DELAY_MS = 1000;

/**
 * @param {D<Model>} model
 * @param {D<Msg>} msg
 * @returns {D<Model>} 
 */
export function update(model, msg) {
    // TODO: si logs deviennent trop gros faut sauvegarder dans fichier externe ou faire buffer circulaire + voir dans render_logs en bas la partie qui enlève les anciens de l'affichage
    switch (msg.type) {
        case 'tick': return tick_update(model, msg);
        case 'start_stop_tick_interval': return start_stop_tick_interval_update(model, msg);
        case 'skip_seconds': return skip_seconds_update(model, msg);
        case 'start_main': return start_main_update(model, msg);
        case 'stop_main': return stop_main_update(model, msg);
        case 'direction': return direction_update(model, msg);
        case 'movement': return movement_update(model, msg);
    }
}

/**
 * @param {D<Model>} model 
 * @param {D<TickMsg>} msg
 * @returns {D<Model>}
 */
function tick_update(model, msg) {
    const [clock, delta_ms] = tick(model.world.clock);
    const world = World.update({ ...model.world, clock }, delta_ms);
    // save_timestamp(clock.timestamp);
    return {
        ...model,
        world,
        logs: [...model.logs, `${msg.type}: ${delta_ms} ms`]
    }
}

/**
 * @param {D<Model>} model 
 * @param {D<StartStopTickIntervalMsg>} msg
 * @returns {D<Model>}
 */
function start_stop_tick_interval_update(model, msg) {
    let tick_interval_id = model.tick_interval_id;
    if (tick_interval_id !== null) {
        clearInterval(tick_interval_id);
        tick_interval_id = null;
    }
    else {
        tick_interval_id = setInterval(() => {
            dispatch({ type: 'tick' });
        }, TICK_DELAY_MS);
    }

    const world_thaw = /**@type {World} */(model.world);
    return {
        ...model,
        tick_interval_id,
        world: { ...world_thaw, clock: { ...model.world.clock, last_tick_timestamp: Date.now() } },
        logs: [...model.logs, `${msg.type}`]
    }
}

// /**
//  * @param {D<Model>} model 
//  * @param {D<SkipSecondsMsg>} msg
//  * @returns {Model}
//  */
// function skip_seconds_update(model, msg) {
//     const clock = advance_clock_by(model.world.clock, msg.amount);
//     const world = World.update({ ...model.world, clock }, msg.amount);
//     // const world = model.world;

//     // TODO: faut append dans le render
//     // save_timestamp(clock.timestamp);
//     return {
//         // ...model,
//         ...model,
//         world,
//         logs: [...model.logs, `${msg.type}: ${msg.amount} ms`]
//     }
// }

/**
 * @param {D<Model>} model 
 * @param {D<SkipSecondsMsg>} msg
 * @returns {D<Model>}
 */
function skip_seconds_update(model, msg) {
    const clock = advance_clock_by(model.world.clock, msg.amount);
    const world = World.update({ ...model.world, clock }, msg.amount);

    // TODO: faut append dans le render
    // save_timestamp(clock.timestamp);
    return {
        ...model,
        world,
        logs: [...model.logs, `${msg.type}: ${msg.amount} ms`]
    }
}

/**
 * @param {D<Model>} model 
 * @param {D<StartMainMsg>} msg
 * @returns {D<Model>}
 */
function start_main_update(model, msg) {
    const model_thaw = /**@type {Model} */(model);
    return {
        ...model_thaw,
        scene: 'main',
        logs: [...model_thaw.logs, `${msg.type}`]
    }
}

/**
 * @param {D<Model>} model 
 * @param {D<StopMainMsg>} msg
 * @returns {D<Model>}
 */
function stop_main_update(model, msg) {
    const model_thaw = /**@type {Model} */(model);
    return {
        ...model_thaw,
        scene: 'menu',
        logs: [...model_thaw.logs, `${msg.type}`]
    }
}

/**
 * @param {D<Model>} model 
 * @param {D<DirectionMsg>} msg
 * @returns {D<Model>}
 */
function direction_update(model, msg) {
    return {
        ...model,
        world: World.change_direction_player(model.world, msg.direction),
        logs: [...model.logs, `${msg.type} ${msg.direction}`]
    }
}

/**
 * @param {D<Model>} model 
 * @param {D<MovementMsg>} msg
 * @returns {D<Model>}
 */
function movement_update(model, msg) {
    const player = Player.get(model.world.entity_repo);
    const target = { ...player.address, coord: /**@type {RoomCoord} */(Coord.add3D(player.address.coord, msg.delta)) };
    const world_res = World.move_player(model.world, target);
    if (Res.is_err(world_res)) {
        return {
            ...model,
            world: model.world,
            logs: [...model.logs, `${msg.type} ${world_res.error}`]
        }
    }
    return {
        ...model,
        world: world_res.value,
        logs: [...model.logs, `${msg.type} ${Address.to_string(player.address)}->${Address.to_string(target)}`]
    }
}
