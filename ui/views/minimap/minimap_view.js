// ui/views/minimap/minimap_view.js
// @ts-check

import '../../../utils/types.js'
import * as Repo from '../../../utils/repository.js'
import * as Player from '../../../engine/entities/player.js'
import * as Room from '../../../engine/map/room.js'
import * as Opt from '../../../utils/option.js'
import * as Address from '../../../engine/map/address.js'
import * as Coord from '../../../engine/map/coord.js'
import * as Area from '../../../engine/map/area.js'
import * as MinimapRoomView from './minimap_room_view.js'

const RENDER_DISTANCE = 5;

/**
 * @param {D<EntityRepo>} entity_repo
 * @param {D<Map3D>} map
 * @returns {string}
 */
export function render(entity_repo, map) {
    let res = `
    <div class="minimap-view">
        <h1>minimap</h1>
        <ul class="minimap-rooms-list" style="grid-template-columns: repeat(${RENDER_DISTANCE * 2 + 1}, 40px);">
            ${render_visible_rooms(entity_repo, map)}
        </ul>
    </div >`;
    return res;
}

/**
 * @param {D<EntityRepo>} entity_repo
 * @param {D<Map3D>} map
 * @returns {string}
 */
function render_visible_rooms(entity_repo, map) {
    const visible_room_opts = visible_room_ids(entity_repo, map);
    const visible_room_coords = visible_room_coord(Player.get(entity_repo).address.coord);
    let res = '';
    for (const coord of visible_room_coords) {
        const id_opt = visible_room_opts[Coord.key_from_3D(coord)];
        if (Opt.is_some(id_opt)) {
            const room = Opt.expect(Repo.get(map.room_repo, id_opt.value), `expected room of id: ${id_opt}`);
            res += MinimapRoomView.render(room);
        }
        else {
            res += MinimapRoomView.render_empty_room(coord);
        }
    }
    return res;
}

/**
 * @param {D<Model>|null} prev
 * @param {D<Model>} next
 */
export function update_all(prev, next) {
    // on peut optimiser et retirer une ligne/colonne seulement mais faut vérifier combien on bouge ou si on change de zone carrement
    // ou rerendre tout seulement quand on change d'étage
    let player_moved = false;
    if (prev) {
        player_moved = Player.get(prev?.world.entity_repo).address !== Player.get(next.world.entity_repo).address;
        if (player_moved) {
            document.querySelectorAll('.minimap-view>.minimap-rooms-list').forEach((e) => {
                const minimap_rooms_list = /**@type {HTMLElement}*/(e);
                minimap_rooms_list.innerHTML = render_visible_rooms(next.world.entity_repo, next.world.map);
                minimap_rooms_list.querySelectorAll('.minimap-room-view').forEach(b => MinimapRoomView.update(prev, next, Repo.id_string_to_id(/**@type {HTMLElement}*/(b).dataset.id), minimap_rooms_list));
                return;
            });
        }
    }

    const map_changed = prev?.world.map === next.world.map;
    if (!prev || map_changed || player_moved) {
        document.querySelectorAll('.minimap-view>.minimap-rooms-list').forEach(
            (e) => {
                const minimap_rooms_list = /**@type {HTMLElement}*/(e);

                if (prev) {
                    // ajout
                    // TODO: n'ajoute pas si prev === null car le render précédent a déjà ajouté
                    // on peut faire un if (entity_description_view_list.querySelector(`.entity - view[data - id="${id}"]`)) === null) pour être sur
                    const prev_ids = Repo.all_ids(prev.world.map.room_repo);
                    for (const id of Repo.all_ids(next.world.map.room_repo)) {
                        const room = Opt.unwrap(Repo.get(next.world.map.room_repo, id));
                        if (!prev_ids.includes(id)) add(minimap_rooms_list, room);
                    }
                    // suppression
                    const next_ids = Repo.all_ids(next.world.map.room_repo);
                    for (const id of Repo.all_ids(prev.world.map.room_repo)) {
                        if (!next_ids.includes(id)) remove(minimap_rooms_list, id);
                    }
                }
                // update
                minimap_rooms_list.querySelectorAll('.minimap-room-view').forEach(b => MinimapRoomView.update(prev, next, Repo.id_string_to_id(/**@type {HTMLElement}*/(b).dataset.id), minimap_rooms_list));
            });
    }
}

/**
 * @param {D<EntityRepo>} entity_repo
 * @param {D<Map3D>} map 
 * @returns {Object.<string, Opt<RoomID>>}
 */
export function visible_room_ids(entity_repo, map) {
    const player = Player.get(entity_repo);
    if (!Address.is_valid(map, player.address)) throw new Error();

    const coords = visible_room_coord(player.address.coord);
    const area = Opt.unwrap(Repo.get(map.area_repo, player.address.area));

    /**@type {Object.<Coord3D, Opt<RoomID>>} */
    const ids = {};
    for (const coord of coords) {
        const room_id_opt = Area.get_room(area, coord);
        ids[Coord.key_from_3D(coord)] = room_id_opt;
    }

    return ids;
}

/**
 * @param {D<Coord3D>} player_coord
 * @returns {Coord3D[]}
 */
export function visible_room_coord(player_coord) {
    /**@type {Coord3D[]} */
    const coords = [];
    let i = 0;
    for (let dy = RENDER_DISTANCE; dy >= -RENDER_DISTANCE; dy--) {
        for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
            coords[i++] = /**@type {Coord3D}*/({ x: player_coord.x + dx, y: player_coord.y + dy, z: player_coord.z });
        }
    }
    return coords;
}

/**
 * @param {HTMLElement} container
 * @param {D<Room>} room
 */
export function add(container, room) { container.insertAdjacentHTML('beforeend', MinimapRoomView.render(room)) }
/**
 * @param {HTMLElement} container
 * @param {RoomID} id
 */
export function remove(container, id) { container.querySelector(`.minimap-room-view[data-id=${id}]`)?.remove() }
