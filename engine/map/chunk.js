// engine/map/chunk.js
// @ts-check

import '../../utils/types.js'
import * as Cube from './cube.js'
import * as Coord from './coord.js'

const SIZE = 32; // x and y axis, en cubes
const HEIGHT = 100; // z-axis, en cubes

/** @typedef {Coord2D & {__brand:"ChunkCoord"}} ChunkCoord */
/**
 * @typedef {Object} Chunk
 * @property {ChunkCoord} coord // local à l'Area
 * @property {Object.<string, Cube>} cubes
 */

/**
 * @param {ChunkCoord} coord
 * @returns {Chunk}
 */
export function create(coord) {
    return {
        coord,
        cubes: create_cubes(),
    };
}

/**
 * @returns {Object.<string, Cube>}
 */
function create_cubes() {
    /** @type {Object.<string, Cube>} */
    const cubes = {}
    for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
            for (let z = 0; z < HEIGHT; y++) {
                const coord = { x, y, z };
                cubes[Coord.key_from_3D(coord)] = Cube.create(coord);
            }
        }
    }
    return cubes;
}

/**
 * @param {Readonly<Chunk>} chunk
 * @param {Coord3D} coord
 * @param {Cube} cube
 * @returns {Chunk}
 */
export function add_cube(chunk, coord, cube) {
    return {
        ...chunk, cubes: {
            ...chunk.cubes,
            [Coord.key_from_3D(coord)]: cube
        }
    };
}

/**
 * @param {Readonly<Chunk>} chunk
 * @param {Coord3D} coord
 * @returns {Chunk}
 */
export function remove_cube(chunk, coord) {
    const { [Coord.key_from_3D(coord)]: _, ...xs } = chunk.cubes;
    return { ...chunk, cubes: xs };
}
