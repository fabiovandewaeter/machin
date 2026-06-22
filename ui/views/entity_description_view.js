// ui/views/entity_description_view.js
// @ts-check

import '../../utils/types.js'
import * as Opt from '../../utils/option.js'
import * as Repo from '../../utils/repository.js'
import * as Address from '../../engine/map/address.js'

// ========== rendering ==========
/**
 * @param {DeepReadonly<EntityRepository>} repo
 * @param {EntityID} id
 * @returns {string}
 */
export function render(repo, id) {
    const entity = Opt.expect(Repo.get(repo, id), `expected entity of id: ${id}`);
    return `
    <div class="entity-view" data-id="${entity.id}">
        id: <span class="entity-id">${entity.id}</span>
        direction: <span class="entity-direction">${entity.direction}</span>
        address: <span class="entity-address">${Address.to_string(entity.address)}</span>
    </div>
    `;
}

/**
 * @param {DeepReadonly<Model>|null} prev
 * @param {DeepReadonly<Model>} next
 * @param {EntityID} id
 * @param {HTMLElement} container
 */
export function update(prev, next, id, container) {
    const next_entity = Opt.expect(Repo.get(next.world.entity_repo, id), `expected entity of id: ${id}`);

    if (prev) {
        const prev_entity = Repo.get(prev.world.entity_repo, id);
        if (Opt.is_some(prev_entity) && Opt.unwrap(prev_entity) === next_entity) return;
    }

    const direction = container.querySelector(`.entity-view[data-id="${id}"] .entity-direction`);
    const address = container.querySelector(`.entity-view[data-id="${id}"] .entity-address`);
    if (!direction || !address) throw new Error();
    direction.textContent = next_entity.direction;
    address.textContent = Address.to_string(next_entity.address);
}

/**
 * @param {DeepReadonly<EntityRepository>} repo
 * @returns {string}
 */
export function render_all(repo) {
    const entities = Repo.all_ids(repo);
    return `
    <div class="entities-view">
        <h1>Entités</h1>
        ${entities.map(id => render(repo, id)).join('')}
    </div>
    `;
}

/**
 * @param {DeepReadonly<Model>|null} prev
 * @param {DeepReadonly<Model>} next
 */
export function update_all(prev, next) {
    if (prev?.world.entity_repo === next.world.entity_repo) return;

    document.querySelectorAll('.entities-view').forEach(
        (bl) => {
            const entity_description_view_list = /**@type {HTMLElement}*/(bl);
            // ajout
            for (const id of Repo.all_ids(next.world.entity_repo)) {
                // TODO: n'ajoute pas si prev === null car le render précédent a déjà ajouté
                // on peut faire un if (entity_description_view_list.querySelector(`.entity-view[data-id="${id}"]`)) === null) pour être sur
                if (prev && !(id in prev.world.entity_repo.elements)) add(entity_description_view_list, next.world.entity_repo, id);
            }
            // suppression
            if (prev) {
                for (const id of Repo.all_ids(prev.world.entity_repo)) {
                    if (!(id in next.world.entity_repo.elements)) remove(entity_description_view_list, id);
                }
            }
            // update
            entity_description_view_list.querySelectorAll('.entity-view').forEach(b => update(prev, next, Repo.id_string_to_id(/**@type {HTMLElement}*/(b).dataset.id), entity_description_view_list));
        });
}

/**
 * @param {HTMLElement} container
 * @param {DeepReadonly<EntityRepository>} repo
 * @param {EntityID} id
 */
export function add(container, repo, id) { container.insertAdjacentHTML('beforeend', render(repo, id)) }
/**
 * @param {HTMLElement} container
 * @param {EntityID} id
 */
export function remove(container, id) { container.querySelector(`.entity-view[data-id=${id}]`)?.remove() }
