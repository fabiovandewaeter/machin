// ui/component/core/comp.js

/**
 * @typedef {import("./utils.js").DestroyFunction} DestroyFunction
 * @typedef {import("./sub_comp_manager.js").SubCompManager} SubCompManager
 */
import { enum_is_enum_key } from "../../../utils/enum.js";
import { subcompmanager_create, subcompmanager_destroy_all } from "./sub_comp_manager.js";

/**
 * @param {HTMLElement} container
 * @param {string} name
 * @param {(root: HTMLElement, add_cleanup: (cleanup: DestroyFunction) => void) => void | DestroyFunction} setup
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function comp_create_comp(container, name, setup) {
    const root = document.createElement("div");
    root.className = name;
    root.dataset.component = name;
    /** @type {DestroyFunction[]} */
    const cleanups = [];
    let destroyed = false;
    const add_cleanup = (/** @type {DestroyFunction} */ cleanup) => {
        if (destroyed) cleanup();
        else cleanups.push(cleanup);
    };
    const destroy = () => {
        if (destroyed) return;
        destroyed = true;
        /** @type {unknown[]} */
        const errors = [];
        for (const cleanup of cleanups.splice(0).reverse()) {
            try {
                cleanup();
            } catch (error) {
                errors.push(error);
            }
        }
        root.remove();
        if (errors.length) throw new AggregateError(errors, `Could not destroy component: ${name}`);
    };
    try {
        const cleanup = setup(root, add_cleanup);
        if (cleanup) add_cleanup(cleanup);
        container.appendChild(root);
    } catch (error) {
        try {
            destroy();
        } catch (cleanup_error) {
            throw new AggregateError([error, cleanup_error], `Could not mount component: ${name}`);
        }
        throw error;
    }
    return { element: root, destroy };
}

/**
 * @param {HTMLElement} container
 * @param {string} name
 * @param {(root: HTMLElement, sub_comps: SubCompManager, add_cleanup: (cleanup: DestroyFunction) => void) => void | DestroyFunction} setup
 * @returns {{element: HTMLElement, destroy: DestroyFunction}}
 */
export function comp_create_comp_with_sub_comps(container, name, setup) {
    return comp_create_comp(container, name, (root, add_cleanup) => {
        const sub_comps = subcompmanager_create();
        add_cleanup(() => subcompmanager_destroy_all(sub_comps));
        return setup(root, sub_comps, add_cleanup);
    });
}

/**
 * @param {HTMLElement} root
 * @param {(action: string, event: Event, target: HTMLElement) => void} handler
 * @returns {DestroyFunction}
 */
export function comp_delegate_click(root, handler) {
    const on_click = (/** @type {Event} */ event) => {
        if (!(event.target instanceof Element) || event.target.closest("[data-component]") !== root) return;
        const target = event.target.closest("[data-action]");
        if (!(target instanceof HTMLElement) || !root.contains(target)) return;
        const action = target.dataset.action;
        if (action) handler(action, event, target);
    };
    root.addEventListener("click", on_click);
    return () => root.removeEventListener("click", on_click);
}

/**
 * @template {Record<string, string>} T
 * @param {HTMLElement} root
 * @param {T} action_enum
 * @param {(action: keyof T & string, event: Event, target: HTMLElement) => void} handler
 * @returns {DestroyFunction}
 */
export function comp_delegate_click_with_enum(root, action_enum, handler) {
    return comp_delegate_click(root, (action, event, target) => {
        if (!enum_is_enum_key(action_enum, action)) throw new Error(`Invalid action: ${action}`);
        handler(action, event, target);
    });
}
