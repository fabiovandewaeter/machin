// ui/views/room_view.js
// @ts-check

import '../../utils/types.js';
import * as Opt from '../../utils/option.js';
import * as Repo from '../../utils/repository.js';
import * as Coord from '../../engine/map/coord.js';

/**@type {Record<RoomType, string>} */
export const ROOM_EMOJIS = {
    city: '🏢',
    river: '🌊',
    forest: '🌳',
    mountain: '⛰️'
}
export const EMPTY_ROOM_EMOJI = ' ';

// TODO: pouvoir personnaliser la Room si on la controle par exemple ajouter stockage et exits et thème etc.

/**
 * @param {D<RoomRepo>} repo
 * @param {RoomID} id
 * @returns {string}
 */
export function render(repo, id) {
    const room = Opt.expect(Repo.get(repo, id), `expected room of id: ${id}`);
    return `
    <div class="room-view" data-id="${room.id}">
        id: <span class="room-id">${room.id}</span>
        coord: <span class="room-coord">${Coord.to_string3D(room.coord)}</span>
        type: <span class="room-type">${ROOM_EMOJIS[room.type]}</span>
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

    const coord = container.querySelector(`.room-view[data-id="${id}"] .room-coord`);
    const type = container.querySelector(`.room-view[data-id="${id}"] .room-type`);
    if (!coord || !type) throw new Error();
    coord.textContent = Coord.to_string3D(next_room.coord);
    type.textContent = ROOM_EMOJIS[next_room.type];
}
