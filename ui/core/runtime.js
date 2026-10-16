// ui/core/runtime.js

import { timeline_advance_to, timeline_init } from "../../engine/core/timeline/timeline.js";
import { world_create, world_init } from "../../engine/core/world/world.js";
import { save_load, save_save } from "../../utils/save.js";
import { scene_init, scene_render_current_scene } from "../scene/scene.js";
import { uisignals_init } from "./signal/signal.js";
import { store_set_world, store_set_ui_state, store_get } from "./store.js";
import { uistate_create } from "./ui_state/ui_state.js";

/**
 * @typedef {import("../../engine/core/world/world.js").World} World
 */

runtime_init();

export function runtime_init() {

    timeline_init();
    uisignals_init();

    scene_init();

    const app = /**@type {HTMLElement}*/(document.getElementById("app"));
    app.tabIndex = -1
    app.focus();

    const saved_opt = save_load();
    if (saved_opt != undefined) {
        let { world, ui_state } = saved_opt;
        if (world) {
            __runtime_load_world(world);
            store_set_world(world);
        } else {
            const new_world = world_create();
            world_init(new_world);
            store_set_world(new_world);
        }
        store_set_ui_state(ui_state || uistate_create());
    } else {
        const new_world = world_create();
        world_init(new_world);
        store_set_world(new_world);
        store_set_ui_state(uistate_create());
    }

    // // attache les events listeners au app pour qu'ils ne soient jamais détruit par un innerHTML
    // add_event_listener_click(app);
    // add_event_listener_keydown(app);

    scene_render_current_scene(app);

    window.addEventListener("beforeunload", () => {
        const store = store_get();
        if (store.should_save) save_save(store.world, store.ui_state);
    })
    window.addEventListener("pagehide", () => {
        const store = store_get();
        if (store.should_save) save_save(store.world, store.ui_state);
    })
}

/**
 * @param {World} world
 */
function __runtime_load_world(world) { timeline_advance_to(world, Date.now()); }

// /**
//  * @param {HTMLElement} app 
//  */
// function add_event_listener_click(app) {
//     app.addEventListener("click", (event) => {
//         const target = event.target instanceof Element ? event.target : null;
//         if (!target) return;
//         const action_el = target.closest("[data-action]");
//         if (!action_el) return;
//         const action_name = action_el.getAttribute("data-action");
//         if (!action_name) return;

//         // @ts-ignore
//         // const handler = Action.get(action_name);
//         // if (option_is_some(handler)) {
//         //     handler.value({ element: action_el, event });
//         // }

//         // // const target = /** @type {HTMLElement | null} */ (el?.closest("[data-action]"));
//         // if (!target) return;

//         // const msg_kind = target.dataset.msgKind;
//         // switch (msg_kind) {
//         //     case "start_stop_tick_interval":
//         //     case "start_main":
//         //     case "stop_main":
//         //     case "download_save":
//         //     case "upload_save":
//         //     case "clear_save":
//         //         dispatch({ kind: msg_kind }); break;
//         //     case "skip_seconds': dispatch({ kind: msg_kind, amount: parseInt(target.dataset.amount ?? '", 10) }); break;
//         //     default: throw new Error(`unknown msg_kind: ${msg_kind}`);
//         // }
//     });
// }

// TODO: ajouter commandes clavier, peut-être pas ici mais dans components ? ou voir s'il y as déjà des actions en HTML normal
// /**
//  * @param {HTMLElement} app 
//  */
// function add_event_listener_keydown(app) {
//     app.addEventListener("keydown", (event) => {
//         // const delta = key_to_delta(event.key);
//         // if (option_is_some(delta)) {
//         //     event.preventDefault(); // empêche scroll avec flèches
//         //     dispatch({ kind: "movement", delta: delta.value });
//         // }
//     });
// }

// function init_test() {
//     TimelineDispatcher.register("craft_complete", (world, event, schedule) => {
//         console.log(
//             `✅ Event déclenché : ${event.kind} à t=${event.at} (sim_time=${world.clock.sim_time})`,
//             event.payload
//         );
//     });

//     const world = world_create();
//     world_init(world);

//     const now = Date.now();
//     console.log("⏳ Temps actuel (now)          :", now);
//     console.log("🕒 sim_time initial            :", world.clock.sim_time);

//     // 3. Planifier un craft qui se termine dans 2 secondes
//     TimelineScheduler.schedule(world.events, "craft_complete', now + 2000, { item: 'épée en bois" });
//     TimelineScheduler.schedule(world.events, "craft_complete', now + 2000, { item: 'épée en bois" });

//     console.log("📅 Prochain event à            :", world_next_event_at(world));

//     // 4. Avancer la simulation de 3 secondes (dépasse la date de l’event)
//     world_advance_by(world, 3000);

//     console.log("🕒 sim_time après avance       :", world.clock.sim_time);
//     console.log("📅 Prochain event (doit être null) :", world_next_event_at(world));
// }
