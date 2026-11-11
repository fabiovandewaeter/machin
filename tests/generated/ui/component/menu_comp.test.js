// tests/generated/ui/component/menu_comp.test.js

import { menucomp_mount } from "../../../../src/ui/component/menu_comp.js";
import { assert, assert_equal } from "../../../shared/assert.js";
import { create_test_store } from "../../../shared/fixtures.js";
import { test } from "../../../shared/test.js";

test("les panneaux usine ne sont montés qu'au clic et retirés au clic suivant", () => {
    create_test_store();
    const component = menucomp_mount(document.createElement("div"));
    try {
        /** @type {[string, string][]} */
        const toggles = [["TOGGLE_FACTORY", ".factory-comp"], ["TOGGLE_FACTORY_EDITOR", ".factory-editor-comp"]];
        for (const [action, selector] of toggles) {
            const button = component.element.querySelector(`button[data-action="${action}"]`);
            assert(button instanceof HTMLButtonElement);
            assert_equal(component.element.querySelectorAll(selector).length, 0);
            button.click();
            assert_equal(component.element.querySelectorAll(selector).length, 1);
            button.click();
            assert_equal(component.element.querySelectorAll(selector).length, 0);
        }
    } finally {
        component.destroy();
    }
});
