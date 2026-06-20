// ui/block/block_view.js
// @ts-check

import '../../utils/types.js'
import * as Opt from '../../utils/option.js'
import * as Repo from '../../utils/repository.js'

// ========== rendering ========== 
/**
 * @param {Readonly<BlockRepository>} repo
 * @param {BlockID} id
 * @returns {string}
 */
export function render(repo, id) {
    const block = Opt.expect(Repo.get(repo, id), `ERROR: expected block of id: ${id}`);
    return `
    <div class="block-view" data-id="${block.id}">
        id: <span class="block-id">${block.id}</span>
        x: <span class="block-x">${block.coord.x}</span>
        y: <span class="block-y">${block.coord.y}</span>
    </div>
    `;
}

/**
 * @param {Readonly<Model>|null} prev
 * @param {Readonly<Model>} next
 * @param {BlockID} id
 * @param {HTMLElement} container
 */
export function update(prev, next, id, container) {
    const next_block = Opt.expect(Repo.get(next.block_repo, id), `ERROR: expected block of id: ${id}`);

    if (prev) {
        const prev_block = Repo.get(prev.block_repo, id);
        if (Opt.is_some(prev_block) && Opt.unwrap(prev_block) === next_block) return;
    }

    const x = container.querySelector(`.block-view[data-id="${id}"] .block-x`);
    const y = container.querySelector(`.block-view[data-id="${id}"] .block-y`);
    if (!x || !y) throw new Error();
    x.textContent = next_block.coord.x.toString();
    y.textContent = next_block.coord.y.toString();
}

/**
 * @param {Readonly<BlockRepository>} repo
 * @returns {string}
 */
export function render_all(repo) {
    const blocks = Repo.all_ids(repo);
    return `
    <div class="blocks-view">
        <h1>Blocs</h1>
        ${blocks.map(id => render(repo, id)).join('')}
    </div>
    `;
}

/**
 * @param {Readonly<Model>|null} prev
 * @param {Readonly<Model>} next
 */
export function update_all(prev, next) {
    if (prev?.block_repo === next.block_repo) return;

    document.querySelectorAll('.blocks-view').forEach(
        (bl) => {
            const block_view_list = /**@type {HTMLElement}*/(bl);

            // ajout
            for (const id of Repo.all_ids(next.block_repo)) {
                // TODO: n'ajoute pas si prev === null car le render précédent a déjà ajouté
                // on peut faire un if (block_view_list.querySelector(`.block-view[data-id="${id}"]`)) === null) pour être sur
                if (prev && !(id in prev.block_repo.elements)) add(block_view_list, next.block_repo, id);
            }

            // suppression
            if (prev) {
                for (const id of Repo.all_ids(prev.block_repo)) {
                    if (!(id in next.block_repo.elements)) remove(block_view_list, id);
                }
            }

            // update
            block_view_list.querySelectorAll('.block-view').forEach(b => update(prev, next, Repo.id_string_to_id(/**@type {HTMLElement}*/(b).dataset.id), block_view_list));
        });
}

/**
 * @param {HTMLElement} container
 * @param {Readonly<BlockRepository>} repo
 * @param {BlockID} id
 */
export function add(container, repo, id) { container.insertAdjacentHTML('beforeend', render(repo, id)) }
/**
 * @param {HTMLElement} container
 * @param {BlockID} id
 */
export function remove(container, id) { container.querySelector(`.block-view[data-id=${id}]`)?.remove() }
