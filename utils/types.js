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
/** @typedef {import('../ui/core/message.js').DirectionMsg} DirectionMsg*/
/** @typedef {import('../ui/core/message.js').MovementMsg} MovementMsg*/
/** @typedef {import('../ui/core/message.js').Msg} Msg*/
// --------------

/** @typedef {import('./repository.js').Repo<Entity, EntityID>} EntityRepo*/

// ========== engine ==========
/** @typedef {import('../engine/core/clock.js').Clock} Clock*/
/** @typedef {import('../engine/core/world.js').World} World*/

// -- map --
/** @typedef {import('../engine/map/direction.js').Direction} Direction*/
/** @typedef {import('../engine/map/coord.js').Coord3D} Coord3D*/
/** @typedef {import('../engine/map/coord.js').Coord2D} Coord2D*/
/** @typedef {import('../engine/map/address.js').Address} Address*/
/** @typedef {import('../engine/map/map.js').Map3D} Map3D*/

/** @typedef {import('../engine/map/continent.js').Continent} Continent*/
/** @typedef {import('../engine/map/continent.js').ContinentID} ContinentID*/
/** @typedef {import('./repository.js').Repo<Continent, ContinentID>} ContinentRepo*/

/** @typedef {import('../engine/map/region.js').Region} Region*/
/** @typedef {import('../engine/map/region.js').RegionID} RegionID*/
/** @typedef {import('./repository.js').Repo<Region, RegionID>} RegionRepo*/

/** @typedef {import('../engine/map/area.js').Area} Area*/
/** @typedef {import('../engine/map/area.js').AreaID} AreaID*/
/** @typedef {import('./repository.js').Repo<Area, AreaID>} AreaRepo*/

/** @typedef {import('../engine/map/room.js').Room} Room*/
/** @typedef {import('../engine/map/room.js').RoomID} RoomID*/
/** @typedef {import('../engine/map/room.js').RoomCoord} RoomCoord*/
/** @typedef {import('../engine/map/room.js').RoomType} RoomType*/
/** @typedef {import('./repository.js').Repo<Room, RoomID>} RoomRepo*/
// ----------

/** @typedef {import('../engine/entities/entity.js').EntityID} EntityID*/
/** @typedef {import('../engine/entities/entity.js').Entity} Entity*/
/** @typedef {import('../engine/entities/player.js').Player} Player*/

// ========== utils ==========
// -- deep readonly --
/**
 * Pareil que Readonly quand on modifie (car obligé de faire un cast inline) mais bloque
 * mieux dans les fonctions qui font que lire
 * @template T
 * @typedef {T extends (...args: any[]) => any
 *   ? T
 *   : T extends Date | RegExp | Error | bigint | string | number | boolean | symbol | null | undefined
 *     ? T
 *     : T extends Map<infer K, infer V>
 *       ? ReadonlyMap<D<K>, D<V>>
 *       : T extends Set<infer U>
 *         ? ReadonlySet<D<U>>
 *         : T extends readonly any[]
 *           ? { readonly [K in keyof T]: D<T[K]> }
 *           : T extends object
 *             ? { readonly [K in keyof T]: D<T[K]> }
 *             : T
 * } D
 */
// -------------------

// -- option --
/**
 * @template T
 * @typedef {{ readonly _tag: "Some", readonly value: T}} Some
 */

/**
 * @typedef {{ readonly _tag: "None"}} None
 */

/**
 * @template T
 * @typedef { Some<T> | None} Opt
 */
// ------------

// -- result --
/**
 * @template T, E
 * @typedef {{ readonly _tag: "Ok", readonly value: T}} Ok
 */

/**
 * @template T, E
 * @typedef {{ readonly _tag: "Err", readonly error: E}} Err
 */

/**
 * @template T, E
 * @typedef {Ok<T, E> | Err<T, E>} Res
 */
// ------------
