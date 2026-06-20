// ui/views/minimap/minimap_chunk_view.js
// @ts-check

// import '../../../utils/types.js';
// import * as Opt from '../../../utils/option.js';
// import * as Repo from '../../../utils/repository.js';
// import * as Player from '../../../engine/entities/player.js';
// import * as Chunk from '../../../engine/map/chunk.js';

// const RENDER_DISTANCE = 3;

// /**
//  * @param {Readonly<ChunkRepository>} repo
//  * @param {ChunkID} id
//  * @returns {string}
//  */
// export function render(repo, id) {
//     const chunk = Opt.expect(Repo.get(repo, id), `ERROR: expected chunk of id: ${id}`);
//     return `
//     <div class="chunk-view" data-id="${chunk.id}">
//         id: <span class="chunk-id">${chunk.id}</span>
//         x: <span class="chunk-x">${chunk.coord.x}</span>
//         y: <span class="chunk-y">${chunk.coord.y}</span>
//     </div>
//     `;
// }

// /**
//  * @param {Readonly<Model>|null} prev
//  * @param {Readonly<Model>} next
//  * @param {ChunkID} id
//  * @param {HTMLElement} container
//  */
// export function update(prev, next, id, container) {
//     const next_chunk = Opt.expect(Repo.get(next.world.entity_repo, id), `ERROR: expected chunk of id: ${id}`);

//     if (prev) {
//         const prev_entity = Repo.get(prev.world.entity_repo, id);
//         if (Opt.is_some(prev_entity) && Opt.unwrap(prev_entity) === next_entity) return;
//     }

//     const x = container.querySelector(`.entity-view[data-id="${id}"] .entity-x`);
//     const y = container.querySelector(`.entity-view[data-id="${id}"] .entity-y`);
//     const z = container.querySelector(`.entity-view[data-id="${id}"] .entity-z`);
//     if (!x || !y || !z) throw new Error();
//     x.textContent = next_entity.coord.x.toString();
//     y.textContent = next_entity.coord.y.toString();
//     z.textContent = next_entity.coord.z.toString();
// }

// /**
//  * @param {Readonly<EntityRepository>} repo
//  * @returns {string}
//  */
// export function render_all(repo) {
//     const entities = Repo.all_ids(repo);
//     return `
//     <div class="entities-view">
//         <h1>Entités</h1>
//         ${entities.map(id => render(repo, id)).join('')}
//     </div>
//     `;
// }

// /**
//  * @param {Readonly<Model>|null} prev
//  * @param {Readonly<Model>} next
//  */
// export function update_all(prev, next) {
//     if (prev?.world.entity_repo === next.world.entity_repo) return;

//     // TODO: update juste les cubes du chunk
//     document.querySelectorAll('.entities-view').forEach(
//         (bl) => {
//             const entity_description_view_list = /**@type {HTMLElement}*/(bl);
//             // ajout
//             for (const id of Repo.all_ids(next.world.entity_repo)) {
//                 // TODO: n'ajoute pas si prev === null car le render précédent a déjà ajouté
//                 // on peut faire un if (entity_description_view_list.querySelector(`.entity-view[data-id="${id}"]`)) === null) pour être sur
//                 if (prev && !(id in prev.world.entity_repo.elements)) add(entity_description_view_list, next.world.entity_repo, id);
//             }
//             // suppression
//             if (prev) {
//                 for (const id of Repo.all_ids(prev.world.entity_repo)) {
//                     if (!(id in next.world.entity_repo.elements)) remove(entity_description_view_list, id);
//                 }
//             }
//             // update
//             entity_description_view_list.querySelectorAll('.entity-view').forEach(b => update(prev, next, Repo.id_string_to_id(/**@type {HTMLElement}*/(b).dataset.id), entity_description_view_list));
//         });
// }

// /**
//  * @param {HTMLElement} container
//  * @param {Readonly<ChunkRepository>} repo
//  * @param {ChunkID} id
//  */
// export function add(container, repo, id) { container.insertAdjacentHTML('beforeend', render(repo, id)) }
// /**
//  * @param {HTMLElement} container
//  * @param {ChunkID} id
//  */
// export function remove(container, id) { container.querySelector(`.chunk-view[data-id=${id}]`)?.remove() }

// /**
//  * @param {Readonly<Model>} model
//  * @returns {ChunkID[]}
//  */
// export function get_visible_chunk_ids(model) {
//     const player = Player.get(model.world.entity_repo);
//     const player_chunk_coord = Chunk.coord_from_coord3D(player.coord);

//     /**@type {Set<ChunkID>} */
//     const ids = new Set();
//     for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
//         for (let dy = -RENDER_DISTANCE; dy <= RENDER_DISTANCE; dy++) {
//             const chunk_id = Opt.unwrap(Chunk.id_from_coord2D(model.world.map, { x: player_chunk_coord.x + dx, y: player_chunk_coord.y + dy }));
//             ids.add(chunk_id);
//         }
//     }
//     return Array.from(ids);
// }
