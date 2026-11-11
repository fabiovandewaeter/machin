// tests/generated/ui/component/core/sub_comp_manager.test.js

import { subcompmanager_add, subcompmanager_create, subcompmanager_destroy_all, subcompmanager_mount_or_toggle, subcompmanager_remove } from "../../../../../src/ui/component/core/sub_comp_manager.js";
import { assert_equal, assert_throws } from "../../../../shared/assert.js";
import { test } from "../../../../shared/test.js";

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
    assert_throws(() => subcompmanager_destroy_all(manager), AggregateError, "Could not destroy subcomponents");
    assert_equal(calls, 1);
    assert_equal(manager.sub_comps.size, 0);
    subcompmanager_destroy_all(manager);
});

test("basculer un enfant le monte puis le détruit", () => {
    const manager = subcompmanager_create();
    let destroyed = 0;
    const create_sub = () => ({ destroy: () => { destroyed++; } });
    assert_equal(subcompmanager_mount_or_toggle(manager, "child", create_sub), true);
    assert_equal(subcompmanager_mount_or_toggle(manager, "child", create_sub), false);
    assert_equal(destroyed, 1);
    assert_equal(manager.sub_comps.size, 0);
});
