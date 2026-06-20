// ui/views/pov_view.js
// @ts-check

import '../../utils/types.js'
import * as Player from '../../engine/entities/player.js'
import * as Coord from '../../engine/map/coord.js'

/**
 * @param {Readonly<EntityRepository>} repo
 * @returns {string}
 */
export function render(repo) {
    const player = Player.get(repo);
    return `
    <div class="pov-view">
        <h1>POV</h1>
        direction: <span class="pov-direction">${player.direction}</span>
        <span class="pov-coord">${Coord.to_string3D(player.coord)}</span>
    </div>
    `;
}

/**
 * @param {Readonly<Model>|null} prev
 * @param {Readonly<Model>} next
 */
export function update(prev, next) {
    const next_player = Player.get(next.world.entity_repo);
    if (prev && Player.get(prev.world.entity_repo) === next_player) return;

    const container = /**@type {HTMLElement}*/(document.querySelector('.pov-view'));
    const direction = container.querySelector(`.pov-view .pov-direction`);
    const coord = container.querySelector(`.pov-view .pov-coord`);
    if (!direction || !coord) throw new Error();
    direction.textContent = next_player.direction;
    coord.textContent = Coord.to_string3D(next_player.coord);
}
