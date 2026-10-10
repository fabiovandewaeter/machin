<!-- README.md -->
# machin

# js
- pas `in` sur une array ça ca regarde les keys donc les indices

# Record<> vs register
- avec tout dans une map on doit importe tous les fichiers et le risque c'est les imports circulaires, donc c'est bien temps qu'on a qu'un seul fichier, et l'avantage c'est qu'avec un type union le compilateur nous dit le cas qu'on a pas géré si on fait un Record ou un switch
- avec register on doit faire un init à chaque fois et centraliser mais comme c'est au runtime il va pas se plaindre car il aura déjà importé toutes les signatures de fonctions. Le problème c'est qu'on a pas le compilateur pour nous dire quel cas on a pas géré

# events
## SignalBus
- Action locale (cliquer pour faire une explosion) -> SignalBus.emit("explosion_occured') -> les SignalBus.on('explosion_occured") réagissent pour update une quête par exemple
## TimelineEvent
- pour faire tourner la simulation, utile pour le mode hors-ligne

# A VOIR
- mettre flag sur attaque refletée pour pas faire boucle

# à faire
- ajouter système jour nuit avec event qui lance un nouvel event dans DAY_MS et change l'état etc.
- pareil pour saisons

# conseils
## id en paramètre vs objet
- dans room.js comme je modifie l'objet et que je vais surement l'appelé depuis une fonction dans World ou autre pour rester cohérent, autant passer l'objet directement
-> en plus comme ça on voit bien la différence entre ce qui est modifié ou pas
-> EN FAIT NON car sinon des fois on peut passer un objet qui a été supprimé car on a inversé deux lignes alors qu'avec l'id on est toujours sur l'état actuel
## comp
- pas de `addEventListener` ni `removeEventListener` faut utiliser `comp_delegate_click()`
- utiliser `add_cleanup()` à chaque fois pour sauvegarder les off() des signalbus_on()
```js
/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function mount(container) {
    return comp_create_comp_with_sub_comps(container, (el, sub_comp_manager, add_cleanup) => {
        el.innerHTML = render();

        add_cleanup(comp_delegate_click(el, {
            toggle_time: (event, btn) => {
                const s = store_get();
                const visible = SCMC.mount_or_toggle(sub_comp_manager, TIME_KEY, () => TimeC.mount(el));
                btn.textContent = visible ? "Hide time" : "Spawn time";
                uistate_add_log(s.ui_state, "toggle_time");
            }
        }));
    });
}
```
```js
/**
 * @param {HTMLElement} el 
 */
function update_toggle_button(el) {
    const s = store_get();
    const button = el.querySelector("button[data-action="toggle_tick"]");
    if (!button) throw new Error();
    button.textContent = s.ui_state.tick_interval_id === null ? "Start" : "Stop";
};

/**
 * @param {HTMLElement} container 
 * @returns {{element: HTMLElement, destroy: DestroyFunction }}
 */
export function mount(container) {
    return comp_create_comp(container, "controls-comp", (el, add_cleanup) => {
        el.innerHTML = render();

        // TODO: PAS BESOIN de addEventListener ni removeEventListener car on a comp_delegate_click()
        // el.addEventListener("click", handle_click);
        add_cleanup(comp_delegate_click(el, (action, event, btn) => {
            if (!Enum.is_enum_key(ACTIONS, action)) throw new Error();
            handle_action(action, btn);
        }));

        add_cleanup(signalbus_on(UISB, "toggle_tick", () => update_toggle_button(el)));
        update_toggle_button(el);
    });
}

/**
 * @param {string} action
 * @param {HTMLElement} btn
 * @returns 
 */
function handle_action(action, btn) {
    // @ts-ignore
    // const btn = event.target.closest("button[data-action]");
    // if (!btn) return;
    // const action = btn.dataset.action;
    const s = store_get();

    switch (action) {
        case "skip_seconds": {
            const ms = Number(btn.dataset.ms);
            if (!Number.isSafeInteger(ms)) throw new Error();
            signalbus_emit(UISB, "tick");
            // save_timestamp(clock.timestamp);
            uistate_add_log(s.ui_state, `skip_seconds: ${ms} ms`);
            break;
        }
        case "toggle_tick": {
            const s = store_get();
            if (s.ui_state.tick_interval_id !== null) {
                clearInterval(s.ui_state.tick_interval_id);
                s.ui_state.tick_interval_id = null;
            }
            else {
                s.ui_state.tick_interval_id = setInterval(() => {
                    const s = store_get();
                    world_advance_by(s.world, TICK_DELAY_MS);
                    signalbus_emit(UISB, "tick");
                    uistate_add_log(s.ui_state, "tick");
                }, TICK_DELAY_MS);
            }
            signalbus_emit(UISB, "toggle_tick");
            uistate_add_log(s.ui_state, "toggle_tick");
            break;
        }
        case "switch_scene": {
            const new_scene = btn.dataset.scene;
            if (new_scene) {
                if (!scene_is_valid_scene(new_scene)) { throw new Error(`Invalid scene: ${new_scene}`); }
                s.ui_state.scene = new_scene;
                uistate_add_log(s.ui_state, `switch_scene: ${new_scene}`);
                signalbus_emit(UISB, "scene_switched", new_scene);
            }
            break;
        }
        case "download_save": {
            save_download(s.world, s.ui_state);
            break;
        }
        case "upload_save": {
            save_upload().then((loaded => {
                if (loaded && loaded.world) {
                    world_advance_to(loaded.world, Date.now());
                    store_set_world(loaded.world);
                    signalbus_emit(UISB, "scene_switched", s.ui_state.scene);
                }
            }));
            break;
        }
        case "clear_save": {
            save_clear();
            break;
        };
        // case "hide_logs": {
        // TODO: si on le remet il faut mettre dans le parent le on() et pas dans le logs_comp directement
        //     signalbus_emit(UISB, "toggle_logs")
        //     break;
        // };
        default: {
            utils_assert_unreachable(action);
        }
    }
};
```
