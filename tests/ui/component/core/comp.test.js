// tests/ui/component/core/comp.test.js

import { comp_create_comp, comp_create_comp_with_sub_comps, comp_delegate_click } from "../../../../ui/component/core/comp.js";
import { subcompmanager_add, subcompmanager_create, subcompmanager_destroy_all, subcompmanager_remove } from "../../../../ui/component/core/sub_comp_manager.js";
import { assert_equal, assert_throws } from "../../../../utils/assert.js";
import { test } from "../../../test.js";

test("les clics d'un composant enfant ne déclenchent pas les actions du parent", () => {
    const container = document.createElement("div");
    let parent_calls = 0;
    let child_calls = 0;
    const parent = comp_create_comp_with_sub_comps(container, "parent", (root, children, add_cleanup) => {
        root.innerHTML = '<button data-action="parent">parent</button>';
        add_cleanup(comp_delegate_click(root, () => parent_calls++));
        subcompmanager_add(children, "child", comp_create_comp(root, "child", (child_root, child_cleanup) => {
            child_root.innerHTML = '<button data-action="child">child</button>';
            child_cleanup(comp_delegate_click(child_root, () => child_calls++));
        }));
    });
    try {
        const child_button = /** @type {HTMLButtonElement} */ (parent.element.querySelector('[data-action="child"]'));
        const parent_button = /** @type {HTMLButtonElement} */ (parent.element.querySelector('[data-action="parent"]'));
        child_button.click();
        assert_equal(child_calls, 1);
        assert_equal(parent_calls, 0);
        parent_button.click();
        assert_equal(parent_calls, 1);
        parent.destroy();
        child_button.click();
        assert_equal(child_calls, 1);
        assert_equal(container.children.length, 0);
    } finally {
        parent.destroy();
    }
});

test("un setup interrompu détruit aussi les abonnements et les enfants déjà créés", () => {
    const container = document.createElement("div");
    const failure = new Error("setup failed");
    let cleanups = 0;
    const error = assert_throws(() => comp_create_comp_with_sub_comps(container, "parent", (root, children, add_cleanup) => {
        add_cleanup(() => { cleanups++; });
        subcompmanager_add(children, "child", comp_create_comp(root, "child", (child_root, child_cleanup) => {
            child_cleanup(() => { cleanups++; });
        }));
        throw failure;
    }));
    assert_equal(error, failure);
    assert_equal(cleanups, 2);
    assert_equal(container.children.length, 0);
});

test("une erreur de cleanup n'interrompt pas les suivants et destroy reste idempotent", () => {
    const container = document.createElement("div");
    /** @type {string[]} */
    const calls = [];
    const component = comp_create_comp(container, "component", (root, add_cleanup) => {
        add_cleanup(() => { calls.push("first"); });
        add_cleanup(() => { calls.push("failing"); throw new Error("cleanup failed"); });
        return () => { calls.push("last"); };
    });
    assert_throws(component.destroy);
    component.destroy();
    assert_equal(calls.join(","), "last,failing,first");
    assert_equal(container.children.length, 0);
});

test("retirer un enfant le détache du manager avant d'appeler son cleanup", () => {
    const manager = subcompmanager_create();
    let calls = 0;
    subcompmanager_add(manager, "child", { destroy: () => {
        calls++;
        assert_equal(subcompmanager_remove(manager, "child"), false);
    } });
    assert_equal(subcompmanager_remove(manager, "child"), true);
    assert_equal(calls, 1);
    assert_equal(manager.sub_comps.size, 0);
});

test("tous les enfants sont détruits même si l'un d'eux échoue", () => {
    const manager = subcompmanager_create();
    let calls = 0;
    subcompmanager_add(manager, "first", { destroy: () => { calls++; } });
    subcompmanager_add(manager, "second", { destroy: () => { throw new Error("child failed"); } });
    assert_throws(() => subcompmanager_destroy_all(manager));
    assert_equal(calls, 1);
    assert_equal(manager.sub_comps.size, 0);
    subcompmanager_destroy_all(manager);
});
