// ui/views/minimap/minimap_cube_view.js
// @ts-check

// import '../../../utils/types.js';
// import * as Opt from '../../../utils/option.js';
// import * as Repo from '../../../utils/repository.js';

// /**
//  * @param {Readonly<CubeRepository>} repo
//  * @param {CubeID} id
//  * @returns {string}
//  */
// export function render(repo, id) {
//     const cube = Opt.expect(Repo.get(repo, id), `ERROR: expected cube of id: ${id}`);
//     return `
//     <div class="cube-view" data-id="${cube.id}">
//         id: <span class="cube-id">${cube.id}</span>
//         x: <span class="cube-x">${cube.coord.x}</span>
//         y: <span class="cube-y">${cube.coord.y}</span>
//         z: <span class="cube-z">${cube.coord.y}</span>
//     </div>
//     `;
// }

// /**
//  * @param {Readonly<Model>|null} prev
//  * @param {Readonly<Model>} next
//  * @param {CubeID} id
//  * @param {HTMLElement} container
//  */
// export function update(prev, next, id, container) {
//     const next_cube = Opt.expect(Repo.get(next.world.entity_repo, id), `ERROR: expected cube of id: ${id}`);

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
//  * @param {Readonly<EntityRepository>} repo
//  * @param {EntityID} id
//  */
// export function add(container, repo, id) { container.insertAdjacentHTML('beforeend', render(repo, id)) }
// /**
//  * @param {HTMLElement} container
//  * @param {EntityID} id
//  */
// export function remove(container, id) { container.querySelector(`.entity-view[data-id=${id}]`)?.remove() }
