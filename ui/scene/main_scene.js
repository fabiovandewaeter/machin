// ui/scene/main_scene.js

/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../component/core/sub_comp_manager.js").SubCompKey} SubCompKey
 * @typedef {import("../../engine/core/ids.types.js").EntityID} EntityID
 */
import { signalbus_on } from "../../utils/signal_bus.js";

import { controlscomp_mount } from "../component/controls_comp.js";
import { comp_create_comp_with_sub_comps } from "../component/core/comp.js";
import { subcompmanager_add, subcompmanager_remove } from "../component/core/sub_comp_manager.js";
import { entitycomp_mount } from "../component/entity_comp.js";
import { logscomp_mount } from "../component/logs_comp.js";
import { menucomp_mount } from "../component/menu_comp.js";
import { roomcomp_mount } from "../component/room_comp.js";
import { timecomp_mount } from "../component/time_comp.js";
import { UISB } from "../core/signal/signal.js";
import { UI_SIGNAL } from "../core/signal/signal.types.js";

/**@type {SubCompKey} */
const __ENTITY_PANEL_KEY = "entity_panel";

/**
 * @returns {string}
 */
export function mainscene_render() {
    return `
<div class="scene-left"> </div>
<div class="scene-right"> </div>
    `;
}

/**
 * @param {HTMLElement} container
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function mainscene_mount(container) {
    return comp_create_comp_with_sub_comps(container, "scene-main", (el, sub_comps, add_cleanup) => {
        el.innerHTML = mainscene_render();

        const left = /**@type {HTMLElement}*/(el.querySelector(".scene-left"));
        const right = /**@type {HTMLElement}*/(el.querySelector(".scene-right"));

        subcompmanager_add(sub_comps, "time", timecomp_mount(left));
        subcompmanager_add(sub_comps, "controls", controlscomp_mount(left));
        subcompmanager_add(sub_comps, "room", roomcomp_mount(left));
        subcompmanager_add(sub_comps, "menu", menucomp_mount(left));
        subcompmanager_add(sub_comps, "logs", logscomp_mount(left));

        add_cleanup(signalbus_on(UISB, UI_SIGNAL.OPEN_ENTITY_PANEL,
            (payload) => {
                subcompmanager_remove(sub_comps, __ENTITY_PANEL_KEY); // no-op si absent
                subcompmanager_add(sub_comps, __ENTITY_PANEL_KEY, entitycomp_mount(right, payload.entity_id));
            }));

        add_cleanup(signalbus_on(UISB, UI_SIGNAL.CLOSE_ENTITY_PANEL,
            () => {
                subcompmanager_remove(sub_comps, __ENTITY_PANEL_KEY);
            }));
    });
}
