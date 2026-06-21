// engine/map/direction.js
// @ts-check

import '../../utils/types.js'

/** @typedef {'NORTH'|'EAST'|'SOUTH'|'WEST'|'UP'|'DOWN'} Direction */

/**
 * @param {Direction} direction
 * @returns {Coord2D}
 */
export function to_delta2D(direction) {
    switch (direction) {
        case 'NORTH': return { x: 0, y: 1 };
        case 'EAST': return { x: 1, y: 0 };
        case 'SOUTH': return { x: 0, y: -1 };
        case 'WEST': return { x: -1, y: 0 };
        default: throw new Error();
    };
}

/**
 * @param {Direction} direction
 * @returns {Coord3D}
 */
export function to_delta3D(direction) {
    switch (direction) {
        case 'NORTH':
        case 'EAST':
        case 'SOUTH':
        case 'WEST':
            return { ...to_delta2D(direction), z: 0 };
        case 'UP': return { x: 0, y: 0, z: 1 };
        case 'DOWN': return { x: 0, y: 0, z: -1 };
    }
}

/**
 * @param {string|undefined} s
 * @return {Direction}
 */
export function from_string(s) {
    switch (s) {
        case 'NORTH':
        case 'EAST':
        case 'SOUTH':
        case 'WEST':
        case 'UP':
        case 'DOWN':
            return s;
        default: throw new Error();
    };
}
