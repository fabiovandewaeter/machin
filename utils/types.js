// utils/types.js
// @ts-check

// ==========  ui ==========
/** @typedef {import('../ui/core/model.js').Model} Model*/

/** @typedef {import('../ui/scenes/scene.js').Scene} Scene*/

// -- messages --
/** @typedef {import('../ui/core/message.js').TickMsg} TickMsg*/
/** @typedef {import('../ui/core/message.js').StartStopTickIntervalMsg} StartStopTickIntervalMsg*/
/** @typedef {import('../ui/core/message.js').SkipSecondsMsg} SkipSecondsMsg*/
/** @typedef {import('../ui/core/message.js').StartMainMsg} StartMainMsg*/
/** @typedef {import('../ui/core/message.js').StopMainMsg} StopMainMsg*/
/** @typedef {import('../ui/core/message.js').AddBlockMsg} AddBlockMsg*/
/** @typedef {import('../ui/core/message.js').DirectionMsg} DirectionMsg*/
/** @typedef {import('../ui/core/message.js').MovementMsg} MovementMsg*/
/** @typedef {import('../ui/core/message.js').Msg} Msg*/
// --------------

/** @typedef {import('../ui/block/block_model.js').Block} Block*/
/** @typedef {import('../ui/block/block_model.js').BlockID} BlockID*/

/** @typedef {import('./repository.js').Repository<Block, BlockID>} BlockRepository */
/** @typedef {import('./repository.js').Repository<Player, EntityID>} EntityRepository*/

// ========== engine ==========
/** @typedef {import('../engine/core/clock.js').Clock} Clock*/
/** @typedef {import('../engine/core/world.js').World} World*/

// -- map --
/** @typedef {import('../engine/map/direction.js').Direction} Direction*/
/** @typedef {import('../engine/map/coord.js').Coord3D} Coord3D*/
/** @typedef {import('../engine/map/coord.js').Coord2D} Coord2D*/
/** @typedef {import('../engine/map/map.js').Map3D} Map3D*/

/** @typedef {import('../engine/map/continent.js').Continent} Continent*/
/** @typedef {import('../engine/map/continent.js').ContinentID} ContinentID*/
/** @typedef {import('./repository.js').Repository<Continent, ContinentID>} ContinentRepository*/

/** @typedef {import('../engine/map/region.js').Region} Region*/
/** @typedef {import('../engine/map/region.js').RegionID} RegionID*/
/** @typedef {import('./repository.js').Repository<Region, RegionID>} RegionRepository*/

/** @typedef {import('../engine/map/area.js').Area} Area*/
/** @typedef {import('../engine/map/area.js').AreaID} AreaID*/
/** @typedef {import('./repository.js').Repository<Area, AreaID>} AreaRepository*/

/** @typedef {import('../engine/map/chunk.js').Chunk} Chunk*/
/** @typedef {import('../engine/map/chunk.js').ChunkCoord} ChunkCoord*/

/** @typedef {import('../engine/map/cube.js').Cube} Cube*/
// ----------

/** @typedef {import('../engine/entities/entity.js').EntityID} EntityID*/
/** @typedef {import('../engine/entities/entity.js').Entity} Entity*/
/** @typedef {import('../engine/entities/player.js').Player} Player*/

// ========== utils ==========
