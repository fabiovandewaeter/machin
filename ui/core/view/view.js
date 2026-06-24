// ui/core/view/view.js
// @ts-nocheck

import * as Subscribers from './subscribers.js'
import * as MainScene from "../../scenes/main_scene.js"
import * as MenuScene from "../../scenes/menu_scene.js"

/**
 * @param {D<Model>|null} prev
 * @param {D<Model>} next 
 */
export function view(prev, next) {
    const app = document.getElementById('app');
    if (!app) throw new Error();

    if (prev?.scene !== next.scene) {
        Subscribers.clear();
        app.innerHTML = '';
        switch (next.scene) {
            case 'menu': MenuScene.render(app, next); break;
            case 'main': MainScene.render(app, next); break;
        }
        // force l'update car si les valeurs n'ont pas changé le prochain switch ne va pas update et il n'y aura que les valeurs par défaut
        Subscribers.notify(null, next);
    }
    else {
        Subscribers.notify(prev, next);
    }
}
