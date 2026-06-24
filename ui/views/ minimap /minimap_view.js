// ui/views/minimap/minimap_view.js
// @ts-check

import '../../../utils/types.js'
import * as Repo from '../../../utils/repository.js'

const RENDER_DISTANCE = 3;

/**
 * @returns {string}
 */
export function render() {
    return `
    <div class="minimap-view">
        <h1>Minimap</h1>
        <ul class="minimap-rooms-list"></ul>
    </div>
    `;
}

/**
 * @param {D<Model>|null} prev
 * @param {D<Model>} next
 */
export function update_all(prev, next) {
    if (prev?.world.map.room_repo === next.world.map.room_repo) return;

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
