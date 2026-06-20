// engine/map/area.js
// @ts-check

import '../../utils/types.js'
import * as Coord from './coord.js'
import * as Repo from '../../utils/repository.js'

const SIZE = 5; // en chunk

/** @typedef {number & {__brand:"AareaID"}} AreaID*/
/**
 * @typedef {Object} Area
 * @property {AreaID} id
 * @property {string} name
 * @property {Object.<string, Chunk>} chunks
 */

/**
 * @param {Readonly<AreaRepository>} repo
 * @param {string} name
 * @returns {[AreaRepository, AreaID]}
 */
export function spawn(repo, name) {
    /** @type {Omit<Area, "id">} */
    const tempo_area = {
        name,
        chunks: {}
    };
    const [new_repo, id] = Repo.spawn_element(repo, tempo_area);
    return [new_repo, id];
}

/**
 * @param {Readonly<Area>} area
 * @param {ChunkCoord} coord
 * @param {Chunk} chunk
 * @returns {Area}
 */
export function add_chunk(area, coord, chunk) {
    return {
        ...area, chunks: {
            ...area.chunks,
            [Coord.key_from_2D(coord)]: chunk
        }
    };
}

/**
 * @param {Readonly<Area>} area
 * @param {ChunkCoord} coord
 * @returns {Area}
 */
export function remove_chunk(area, coord) {
    const { [Coord.key_from_2D(coord)]: _, ...xs } = area.chunks;
    return { ...area, chunks: xs };
}
