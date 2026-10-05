// ui/core/component/core/comp.js
// @ts-check

/**
 * @typedef {import("./sub_comp_manager.js").SubCompManager} SubCompManager
 */
import * as SCM from "./sub_comp_manager.js";
import * as Enum from "../../../utils/enum.js";
// /** @typedef {() => void} DestroyFunction */
/**
 * @callback DestroyFunction
 * @returns {void}
 */

/**
 * Crée un composant avec un cycle de vie standard.
 * @param {HTMLElement} container
 * @param {string} name
 * @param {(root: HTMLElement, add_cleanup: (fn: DestroyFunction) => void) => void | DestroyFunction} setup
 *        - `add_cleanup` : enregistre une fonction de nettoyage (sera appelée au destroy).
 *        - le retour éventuel de `setup` est aussi utilisé comme nettoyage.
 * @returns {{ element: HTMLElement, destroy: DestroyFunction }}
 */
export function create_comp(container, name, setup) {
    const root = document.createElement("div");
    root.className = name;
    /**@type {Function[]} */
    const cleanups = [];

    // ajoute les fonctions off des SignalBus.on() à la fonction destroy pour ne pas oublier
    const add_cleanup = (/** @type {Function} */ fn) => cleanups.push(fn);
    const internal_destroy = setup(root, add_cleanup);

    const destroy = () => {
        // internal_destroy();
        // d'abord les nettoyages explicites (retour du setup)
        if (typeof internal_destroy === "function") {
            internal_destroy();
        }
        // puis tous les nettoyages enregistrés (dans l'ordre inverse d'ajout, par sécurité)
        for (let i = cleanups.length - 1; i >= 0; i--) {
            cleanups[i]();
        }
        root.remove();
    };

    container.appendChild(root);
    return { element: root, destroy };
}

/**
 * Version qui gère en plus un SubCompManager.
 * @param {HTMLElement} container
 * @param {string} name
 * @param {(root: HTMLElement, sub_comps: SubCompManager, add_cleanup: (fn: DestroyFunction) => void) => void | DestroyFunction} setup
 * @returns {{ element: HTMLElement, destroy: DestroyFunction }}
 */
export function create_comp_with_sub_comps(container, name, setup) {
    return create_comp(container, name, (root, add_cleanup) => {
        const sub_comps = SCM.create();
        // On enregistre la destruction des sous-composants comme nettoyage automatique.
        add_cleanup(() => SCM.destroy_all(sub_comps));
        // On appelle le setup de l'utilisateur avec le manager et addCleanup.
        return setup(root, sub_comps, add_cleanup);
    });
}

/**
 * Attache un écouteur de clic par délégation sur l'élément racine.
 * @param {HTMLElement} root
 * @param {(action: string, event: Event, target: HTMLElement) => void} handler
 * @returns {DestroyFunction}
 */
export function delegate_click(root, handler) {
    /** @type {(event: Event) => void} */
    const on_click = (event) => {
        const target = (event.target instanceof Element)
            ? event.target.closest("[data-action]")
            : null;
        if (!target) return; // clic hors bouton donc on ignore

        const action = target.getAttribute("data-action");
        if (action) {
            handler(action, event, /** @type {HTMLElement} */(target));
        }
    };
    root.addEventListener("click", on_click);
    return () => root.removeEventListener("click", on_click);
}

/**
 * Attache un écouteur de clic par délégation sur l'élément racine.
 * @template {Record<string, string>} T
 * @param {HTMLElement} root
 * @param {T} action_enum
 * @param {(action: T[keyof T], event: Event, target: HTMLElement) => void} handler
 * @returns {DestroyFunction} fonction de désabonnement
 */
export function delegate_click_with_enum(root, action_enum, handler) {
    return delegate_click(root, (action, event, target) => {
        if (!Enum.is_enum_value(action_enum, action)) throw new Error(`Invalid action: ${action}`);
        handler(action, event, target);
    });
}
