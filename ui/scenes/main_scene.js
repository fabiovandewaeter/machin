// ui/scenes/main_scene.js
// @ts-check

import '../../utils/types.js';
import * as Subscribers from '../core/view/subscribers.js';
import * as Time from '../views/time_view.js';
import * as Control from '../views/controls_view.js';
import * as Block from '../block/block_view.js';
import * as POV from '../views/pov_view.js';
import * as Log from '../views/logs_view.js';
import * as EntityDescriptionView from '../views/entity_description_view.js';

/**
 * @param {HTMLElement} container
 * @param {Readonly<Model>} model
 */
export function render(container, model) {
    container.innerHTML += `
    <h1>Scene: Main</h1>
    ${Time.render()}
    ${Control.render()}
    ${POV.render(model.world.entity_repo)}
    ${Block.render_all(model.block_repo)}
    ${EntityDescriptionView.render_all(model.world.entity_repo)}
    ${Log.render()}
    `;

    Subscribers.subscribe('times', Time.update_all);
    Subscribers.subscribe('controls', Control.update_all);
    Subscribers.subscribe('pov', POV.update);
    Subscribers.subscribe('blocks', Block.update_all);
    Subscribers.subscribe('entityviews', EntityDescriptionView.update_all);
    Subscribers.subscribe('logs', Log.update_all);
}
