// ui/core/update.js
// @ts-check

import '../../utils/types.js'
import { advance_clock_by, tick } from '../../engine/core/clock.js'
import { dispatch } from './runtime.js'
import * as World from '../../engine/core/world.js'
import * as Coord from '../../engine/map/coord.js'
import * as Address from '../../engine/map/address.js'
import * as Player from '../../engine/entities/player.js'

const TICK_DELAY_MS = 1000;

/**
 * @param {DeepReadonly<Model>} model
 * @param {DeepReadonly<Msg>} msg
 * @returns {Model} 
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
 * @param {DeepReadonly<Model>} model 
 * @param {DeepReadonly<TickMsg>} msg
 * @returns {Model}
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
 * @param {DeepReadonly<Model>} model 
 * @param {DeepReadonly<StartStopTickIntervalMsg>} msg
 * @returns {Model}
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

    return {
        ...model,
        tick_interval_id,
        world: { ...model.world, clock: { ...model.world.clock, last_tick_timestamp: Date.now() } },
        logs: [...model.logs, `${msg.type}`]
    }
}

/**
 * @param {DeepReadonly<Model>} model 
 * @param {DeepReadonly<SkipSecondsMsg>} msg
 * @returns {Model}
 */
function skip_seconds_update(model, msg) {
    const clock = advance_clock_by(model.world.clock, msg.amount);
    const world = World.update({ ...model.world, clock }, msg.amount);

    // TODO: faut append dans le render
    // save_timestamp(clock.timestamp);
    return {
        // ...model,
        ...model,
        world,
        logs: [...model.logs, `${msg.type}: ${msg.amount} ms`]
    }
}

/**
 * @param {DeepReadonly<Model>} model 
 * @param {DeepReadonly<StartMainMsg>} msg
 * @returns {Model}
 */
function start_main_update(model, msg) {
    return {
        ...model,
        scene: 'main',
        logs: [...model.logs, `${msg.type}`]
    }
}

/**
 * @param {DeepReadonly<Model>} model 
 * @param {DeepReadonly<StopMainMsg>} msg
 * @returns {Model}
 */
function stop_main_update(model, msg) {
    return {
        ...model,
        scene: 'menu',
        logs: [...model.logs, `${msg.type}`]
    }
}

/**
 * @param {DeepReadonly<Model>} model 
 * @param {DeepReadonly<DirectionMsg>} msg
 * @returns {Model}
 */
function direction_update(model, msg) {
    return {
        ...model,
        world: World.change_direction_player(model.world, msg.direction),
        logs: [...model.logs, `${msg.type} ${msg.direction}`]
    }
}

/**
 * @param {DeepReadonly<Model>} model 
 * @param {DeepReadonly<MovementMsg>} msg
 * @returns {Model}
 */
function movement_update(model, msg) {
    const player = Player.get(model.world.entity_repo);
    const target = { ...player.address, coord: /**@type {RoomCoord} */(Coord.add3D(player.address.coord, msg.delta)) };
    return {
        ...model,
        world: World.move_player(model.world, target),
        logs: [...model.logs, `${msg.type} ${Address.to_string(player.address)}->${Address.to_string(target)}`]
    }
}
