// ui/scene/main_scene.js
// @ts-check

/**
 * @typedef {import("../component/core/comp.js").DestroyFunction} DestroyFunction
 * @typedef {import("../component/core/sub_comp_manager.js").SubCompKey} SubCompKey
 * @typedef {import("../../engine/entity/entity.js").EntityID} EntityID
 */
import "../../utils/types.js"
import * as TimeC from "../component/time_comp.js";
import * as ControlC from "../component/controls_comp.js";
import * as RoomC from "../component/room_comp.js";
import * as MenuC from "../component/menu_comp.js";
import * as LogC from "../component/logs_comp.js";
import * as Comp from "../component/core/comp.js";
import * as EntityC from "../component/entity_comp.js";
import * as SCM from "../component/core/sub_comp_manager.js";
import * as UISB from "../core/signals.js";
import * as SB from "../../utils/signal_bus.js";

/**@type {SubCompKey} */
const ENTITY_PANEL_KEY = "entity_panel";

/**
 * @returns {string}
 */
export function render() {
    return `
<div class="scene-left"> </div>
<div class="scene-right"> </div>
    `;
}

/**
 * @param {HTMLElement} container
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function mount(container) {
    return Comp.create_comp_with_sub_comps(container, "scene-main", (el, sub_comps, add_cleanup) => {
        el.innerHTML = render();

        const left = /**@type {HTMLElement}*/(el.querySelector(".scene-left"));
        const right = /**@type {HTMLElement}*/(el.querySelector(".scene-right"));

        SCM.add(sub_comps, "time", TimeC.mount(left));
        SCM.add(sub_comps, "controls", ControlC.mount(left));
        SCM.add(sub_comps, "room", RoomC.mount(left));
        SCM.add(sub_comps, "menu", MenuC.mount(left));
        SCM.add(sub_comps, "logs", LogC.mount(left));

        add_cleanup(SB.on(UISB.BUS, UISB.UI_SIGNAL.OPEN_ENTITY_PANEL,
            (payload) => {
                SCM.remove(sub_comps, ENTITY_PANEL_KEY); // no-op si absent
                SCM.add(sub_comps, ENTITY_PANEL_KEY, EntityC.mount(right, payload.entity_id));
            }));

        add_cleanup(SB.on(UISB.BUS, UISB.UI_SIGNAL.CLOSE_ENTITY_PANEL,
            () => {
                SCM.remove(sub_comps, ENTITY_PANEL_KEY);
            }));
    });
}
