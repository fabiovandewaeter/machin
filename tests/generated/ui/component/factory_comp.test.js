// tests/generated/ui/component/factory_comp.test.js

import { world_move_entity, world_set_flow_connection_limit } from "../../../../src/engine/core/world/world.js";
import { factorycomp_mount } from "../../../../src/ui/component/factory_comp.js";
import { result_assert_ok } from "../../../../src/utils/result.js";
import { undefined_unwrap } from "../../../../src/utils/undefined.js";
import { assert, assert_equal } from "../../../shared/assert.js";
import { create_test_store } from "../../../shared/fixtures.js";
import { test } from "../../../shared/test.js";

test("le panneau usine affiche les noeuds, machines, débits et sorties de la salle et suit les changements", () => {
    const { world, entity, factory_room } = create_test_store();
    const component = factorycomp_mount(document.createElement("div"));
    /** @param {string} selector */
    const count = selector => component.element.querySelectorAll(selector).length;
    assert_equal(component.element.querySelector(".factory-status")?.textContent, "Aucune machine dans cette salle");
    assert_equal(count(".factory-graph svg"), 0);
    result_assert_ok(world_move_entity(world, entity.id, factory_room.id));
    assert_equal(component.element.querySelector(".factory-status")?.textContent, `Salle #${factory_room.id} usine`);
    assert_equal(count(".factory-graph .resource-node"), 4);
    assert_equal(count(".factory-graph .machine"), 7);
    assert_equal(count(".factory-graph line.flow-edge"), 5);
    assert_equal(count(".factory-graph .leaf"), 2);
    assert_equal([...component.element.querySelectorAll(".factory-outputs div")].map(line => line.textContent).join(","),
        "STONE_ORE 900,COPPER_ORE 400,IRON_ORE 600,WATER 1500,IRON_INGOT 200,BRONZE_INGOT 400");
    const truck = undefined_unwrap(world.flow_connection_repo.elements.find(connection => connection.kind === "TRUCK"));
    result_assert_ok(world_set_flow_connection_limit(world, truck.id, 100));
    assert(component.element.querySelector(".factory-connections")?.textContent?.includes("IRON_ORE 100") === true);
    component.destroy();
});
