// tests/generated/ui/component/factory_editor_comp.test.js

import { factoryeditorcomp_mount } from "../../../../src/ui/component/factory_editor_comp.js";
import { array_get } from "../../../../src/utils/array.js";
import { undefined_unwrap } from "../../../../src/utils/undefined.js";
import { assert, assert_equal } from "../../../shared/assert.js";
import { amounts_to_string, create_test_store } from "../../../shared/fixtures.js";
import { test } from "../../../shared/test.js";

function __create_editor() {
    const store = create_test_store({ in_factory_room: true });
    const container = document.createElement("div");
    document.body.appendChild(container);
    return { ...store, container, component: factoryeditorcomp_mount(container) };
}

/**
 * @param {HTMLElement} root
 * @param {string} selector
 * @param {string} value
 */
function __change(root, selector, value) {
    const field = root.querySelector(selector);
    assert(field instanceof HTMLSelectElement || field instanceof HTMLInputElement, `Missing field: ${selector}`);
    field.value = value;
    field.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * @param {HTMLElement} root
 * @param {string} selector
 */
function __click(root, selector) {
    const button = root.querySelector(selector);
    assert(button instanceof HTMLButtonElement, `Missing button: ${selector}`);
    button.click();
}

test("l'éditeur d'usine modifie les recettes et les limites via ses menus", () => {
    const { world, container, component } = __create_editor();
    const root = component.element;
    try {
        const furnace = undefined_unwrap(world.machine_repo.elements.find(machine => machine.recipe_id === "COPPER_SMELTING"));
        const recipe_select = root.querySelector(`select[data-machine-id="${furnace.id}"]`);
        assert(recipe_select instanceof HTMLSelectElement);
        assert_equal([...recipe_select.options].map(option => option.value).join(), ",COPPER_SMELTING,IRON_SMELTING,BRONZE_SMELTING");
        __change(root, `select[data-machine-id="${furnace.id}"]`, "IRON_SMELTING");
        assert_equal(furnace.recipe_id, "IRON_SMELTING");
        __change(root, `select[data-machine-id="${furnace.id}"]`, "");
        assert_equal(furnace.recipe_id, undefined);
        const truck = undefined_unwrap(world.flow_connection_repo.elements.find(connection => connection.kind === "TRUCK"));
        __change(root, `input[data-connection-id="${truck.id}"]`, "150");
        assert_equal(truck.manual_throughput_limit, 150);
        assert_equal(amounts_to_string(truck.throughput), "IRON_ORE=150");
    } finally {
        component.destroy();
        container.remove();
    }
});

test("l'éditeur d'usine crée et supprime des connexions et journalise les refus", () => {
    const { world, ui_state, container, component } = __create_editor();
    const root = component.element;
    try {
        const count = world.flow_connection_repo.elements.length;
        const [first, second] = [array_get(world.machine_repo.elements, 4), array_get(world.machine_repo.elements, 5)];
        __change(root, ".connect-from", String(first.id));
        __change(root, ".connect-to", String(second.id));
        __change(root, ".connect-kind", "PIPE");
        __click(root, `button[data-action="CONNECT"]`);
        const created = undefined_unwrap(world.flow_connection_repo.elements.find(connection => connection.from === first.id && connection.to === second.id));
        assert_equal(created.kind, "PIPE");
        __change(root, ".connect-from", String(first.id));
        __change(root, ".connect-to", String(first.id));
        __click(root, `button[data-action="CONNECT"]`);
        assert_equal(world.flow_connection_repo.elements.length, count + 1);
        assert(ui_state.logs.some(log => log.includes("cannot be connected to itself")));
        __click(root, `button[data-action="DISCONNECT"][data-connection-id="${created.id}"]`);
        assert_equal(world.flow_connection_repo.elements.length, count);
    } finally {
        component.destroy();
        container.remove();
    }
});
