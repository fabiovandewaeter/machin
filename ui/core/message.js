// ui/core/message.js

/** @typedef {{type: 'tick'}} TickMsg*/
/** @typedef {{type: 'start_stop_tick_interval'}} StartStopTickIntervalMsg*/

/** @typedef {{type: 'skip_seconds', amount: number}} SkipSecondsMsg*/

/** @typedef {{type: 'start_main'}} StartMainMsg*/
/** @typedef {{type: 'stop_main'}} StopMainMsg*/

/** @typedef {{type: 'add_block'}} AddBlockMsg*/

/** @typedef {{type: 'direction', direction: Direction }} DirectionMsg*/
/** @typedef {{type: 'movement', delta: Coord3D}} MovementMsg*/

/** @typedef {TickMsg|StartStopTickIntervalMsg|SkipSecondsMsg|StartMainMsg|StopMainMsg|AddBlockMsg|DirectionMsg|MovementMsg} Msg*/

export { };
