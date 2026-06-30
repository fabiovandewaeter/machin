// ui/views/minimap/minimap_room_view.js
// @ts-check

import '../../../utils/types.js';
import * as Opt from '../../../utils/option.js';
import * as Repo from '../../../utils/repository.js';
import * as Coord from '../../../engine/map/coord.js';
import * as Area from '../../../engine/map/area.js';
import { EMPTY_ROOM_EMOJI, ROOM_EMOJIS } from '../room_view.js';

/**
 * @param {D<Room>} room
 * @returns {string}
 */
export function render(room) {
    return `
    <div class="room-view" data-coord="${Coord.key_from_3D(room.coord)}">
        <button class="room-type" title="${Coord.to_string3D(room.coord)}">${ROOM_EMOJIS[room.type]}</button>
    </div>
    `;
}

/**
 * @param {D<Coord3D>} coord
 * @returns {string}
 */
export function render_empty_room(coord) {
    return `
    <div class="room-view" data-coord="${Coord.key_from_3D(coord)}">
        <button class="room-type" title="${Coord.to_string3D(coord)}">${EMPTY_ROOM_EMOJI}</button>
    </div>
    `;
}

/**
 * @param {D<Model>|null} prev
 * @param {D<Model>} next
 * @param {RoomID} id
 * @param {HTMLElement} container
 */
export function update(prev, next, id, container) {
    const next_room = Opt.expect(Repo.get(next.world.map.room_repo, id), `expected room of id: ${id}`);

    if (prev) {
        const prev_room = Repo.get(prev.world.map.room_repo, id);
        if (Opt.is_some(prev_room) && Opt.unwrap(prev_room) === next_room) return;
    }

    const type = container.querySelector(`.room-view[data-id="${id}"] .room-type`);
    if (!type) throw new Error();
    type.textContent = ROOM_EMOJIS[next_room.type];
}
