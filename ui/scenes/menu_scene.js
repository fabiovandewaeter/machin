// ui/scenes/menu_scene.js
// @ts-check

import '../../utils/types.js';

/**
 * @param {HTMLElement} container
 * @param {Readonly<Model>} model
 */
export function render(container, model) {
    container.innerHTML += `
    <h1>Scene: Menu</h1>
    <div id="controls">
        <button data-msg-type="start_main">Start main</button>
    </div>
    `;

    // Subscribers.subscribe();
}
