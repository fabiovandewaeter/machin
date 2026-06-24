// ui/views/pov_view.js
// @ts-check

import '../../utils/types.js'
import * as Player from '../../engine/entities/player.js'
import * as Address from '../../engine/map/address.js'

/**
 * @param {D<EntityRepo>} repo
 * @returns {string}
 */
export function render(repo) {
    const player = Player.get(repo);
    return `
    <div class="pov-view">
        <h1>POV</h1>
        direction: <span class="pov-direction">${player.direction}</span>
        address: <span class="pov-address">${Address.to_string(player.address)}</span>
    </div>
    `;
}

/**
 * @param {D<Model>|null} prev
 * @param {D<Model>} next
 */
export function update(prev, next) {
    const next_player = Player.get(next.world.entity_repo);
    if (prev && Player.get(prev.world.entity_repo) === next_player) return;

    const container = /**@type {HTMLElement}*/(document.querySelector('.pov-view'));

    const direction = container.querySelector(`.pov-view .pov-direction`);
    const address = container.querySelector(`.pov-view .pov-address`);
    if (!direction || !address) throw new Error();
    direction.textContent = next_player.direction;
    address.textContent = Address.to_string(next_player.address);
}
