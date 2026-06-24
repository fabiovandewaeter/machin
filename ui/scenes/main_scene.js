// ui/scenes/main_scene.js
// @ts-check

import '../../utils/types.js';
import * as Subscribers from '../core/view/subscribers.js';
import * as Time from '../views/time_view.js';
import * as Control from '../views/controls_view.js';
import * as POV from '../views/pov_view.js';
import * as Log from '../views/logs_view.js';
import * as EntityDescriptionView from '../views/entity_description_view.js';

/**
 * @param {HTMLElement} container
 * @param {D<Model>} model
 */
export function render(container, model) {
    container.innerHTML += `
    <h1>Scene: Main</h1>
    ${Time.render()}
    ${Control.render()}
    ${POV.render(model.world.entity_repo)}
    ${EntityDescriptionView.render_all(model.world.entity_repo)}
    ${Log.render()}
    `;

    Subscribers.subscribe('times', Time.update_all);
    Subscribers.subscribe('controls', Control.update_all);
    Subscribers.subscribe('pov_main_scene', POV.update);
    Subscribers.subscribe('entityviews', EntityDescriptionView.update_all);
    Subscribers.subscribe('logs', Log.update_all);
}
