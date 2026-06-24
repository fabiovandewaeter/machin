// engine/map/coord.js
// @ts-check

/**
 *         NORTH (+y)
 *           ^    UP (+z)
 *           |     / 
 *           |   /
 * WEST (-x) | /
 * <---------+---------> EAST (+x)
 *         ; | 
 *       ;   | 
 *     ;     | 
 * DOWN (-z) V
 *         SOUTH (-y)
 * 
 * Coord2D/RoomCoord = coin en bas à gauche
 * 
 * 
 * 
 * 
 * 
 * (-5,4) (-4,4) (-3,4) (-2,4) (-1,4) |(0,4) (1,4) (2,4) (3,4) (4,4)
 * (-5,3) (-4,3) (-3,3) (-2,3) (-1,3) |(0,3) (1,3) (2,3) (3,3) (4,3)
 * (-5,2) (-4,2) (-3,2) (-2,2) (-1,2) |(0,2) (1,2) (2,2) (3,2) (4,2)
 * (-5,1) (-4,1) (-3,1) (-2,1) (-1,1) |(0,1) (1,1) (2,1) (3,1) (4,1)
 * (-5,0) (-4,0) (-3,0) (-2,0) (-1,0) |(0,0) (1,0) (2,0) (3,0) (4,0)
 * -----------------------------------+------------------------------
 * (-5,-1)(-4,-1)(-3,-1)(-2,-1)(-1,-1)|(0,-1)(1,-1)(2,-1)(3,-1)(4,-1)
 * (-5,-2)(-4,-2)(-3,-2)(-2,-2)(-1,-2)|(0,-2)(1,-2)(2,-2)(3,-2)(4,-2)
 * (-5,-3)(-4,-3)(-3,-3)(-2,-3)(-1,-3)|(0,-3)(1,-3)(2,-3)(3,-3)(4,-3)
 * (-5,-4)(-4,-4)(-3,-4)(-2,-4)(-1,-4)|(0,-4)(1,-4)(2,-4)(3,-4)(4,-4)
 * (-5,-5)(-4,-5)(-3,-5)(-2,-5)(-1,-5)|(0,-5)(1,-5)(2,-5)(3,-5)(4,-5)
 */

/** @typedef {{x: number, y: number}} Coord2D */
/** @typedef {{x: number, y: number, z: number}} Coord3D */

/**
 * @param {D<Coord2D>} a 
 * @param {D<Coord2D>} b 
 * @returns {Coord2D}
 */
export function add2D(a, b) { return { x: a.x + b.x, y: a.y + b.y }; }

/**
 * @param {D<Coord3D>} a 
 * @param {D<Coord3D>} b 
 * @returns {Coord3D}
 */
export function add3D(a, b) { return { ...add2D(a, b), z: a.z + b.z }; }

/**
 * @param {D<Coord3D>} c
 * @returns {Coord2D}
 */
export function to_2D(c) { return { x: c.x, y: c.x }; }

/**
 * @param {D<Coord3D>} coord
 * @returns {string}
 */
export function key_from_3D(coord) { return `${coord.x},${coord.y},${coord.z}`; }

/**
 * @param {D<Coord2D>} coord
 * @returns {string}
 */
export function key_from_2D(coord) { return `${coord.x},${coord.y}`; }

/**
 * @param {D<Coord3D>} coord
 * @returns {string}
 */
export function to_string3D(coord) { return `{x: ${coord.x}, y: ${coord.y}, z: ${coord.z}}`; }

/**
 * @param {D<Coord2D>} coord
 * @returns {string}
 */
export function to_string2D(coord) { return `{x: ${coord.x}, y: ${coord.y}}`; }
