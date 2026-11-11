// tests/generated/engine/machine/flow.test.js

import { enginesignal_on } from "../../../../src/engine/core/signal/signal.js";
import { world_connect_machines, world_disconnect_machines, world_remove_machine, world_set_flow_connection_limit, world_set_machine_recipe } from "../../../../src/engine/core/world/world.js";
import { repository_get } from "../../../../src/utils/repository.js";
import { result_assert_err, result_assert_ok, result_unwrap } from "../../../../src/utils/result.js";
import { undefined_unwrap } from "../../../../src/utils/undefined.js";
import { assert, assert_equal, assert_unchanged } from "../../../shared/assert.js";
import { amounts_to_string, create_test_factory } from "../../../shared/fixtures.js";
import { test } from "../../../shared/test.js";

/**
 * @param {import("../../../../src/engine/core/world/world.types.js").World} world
 * @param {import("../../../../src/engine/core/ids.types.js").MachineID} machine_id
 * @returns {string}
 */
function __production(world, machine_id) {
    return amounts_to_string(undefined_unwrap(repository_get(world.machine_repo, machine_id)).production);
}

test("changer la recette recalcule les débits", () => {
    const { world, copper_extractor, furnaces: [furnace] } = create_test_factory();
    const connection = result_unwrap(world_connect_machines(world, copper_extractor, furnace, "BELT"));
    assert_equal(amounts_to_string(connection.throughput), "");
    result_assert_ok(world_set_machine_recipe(world, furnace, "COPPER_SMELTING"));
    assert_equal(amounts_to_string(connection.throughput), "COPPER_ORE=600");
    result_assert_ok(world_set_machine_recipe(world, furnace, undefined));
    assert_equal(amounts_to_string(connection.throughput), "");
});

test("une recette incompatible avec la machine ou son noeud est refusée sans mutation", () => {
    const { world, stone_extractor, furnaces: [furnace] } = create_test_factory();
    assert_unchanged(world, () => {
        result_assert_err(world_set_machine_recipe(world, furnace, "STONE_EXTRACTION"));
        result_assert_err(world_set_machine_recipe(world, stone_extractor, "COPPER_EXTRACTION"));
        result_assert_err(world_set_machine_recipe(world, stone_extractor, "COPPER_SMELTING"));
        result_assert_err(world_set_machine_recipe(world, stone_extractor, "WATER_PUMPING"));
        result_assert_err(world_set_machine_recipe(world, stone_extractor, /** @type {never} */ ("UNKNOWN")));
    });
});

test("une offre limitée est répartie proportionnellement en entiers", () => {
    const { world, copper_extractor, furnaces } = create_test_factory();
    const connections = furnaces.map(furnace => {
        result_assert_ok(world_set_machine_recipe(world, furnace, "COPPER_SMELTING"));
        return result_unwrap(world_connect_machines(world, copper_extractor, furnace, "BELT"));
    });
    assert_equal(connections.map(connection => amounts_to_string(connection.throughput)).join(";"), "COPPER_ORE=334;COPPER_ORE=333;COPPER_ORE=333");
});

test("la limite manuelle plafonne le débit et notifie uniquement les changements", () => {
    const { world, copper_extractor, furnaces: [furnace] } = create_test_factory();
    result_assert_ok(world_set_machine_recipe(world, furnace, "COPPER_SMELTING"));
    const connection = result_unwrap(world_connect_machines(world, copper_extractor, furnace, "BELT"));
    let calls = 0;
    enginesignal_on("flow_connection.throughput.changed", payload => {
        assert_equal(payload.flow_connection_id, connection.id);
        calls++;
    });
    result_assert_ok(world_set_flow_connection_limit(world, connection.id, 100));
    result_assert_ok(world_set_flow_connection_limit(world, connection.id, 100));
    assert_equal(amounts_to_string(connection.throughput), "COPPER_ORE=100");
    assert_equal(calls, 1);
    result_assert_ok(world_set_flow_connection_limit(world, connection.id, 0));
    assert_equal(amounts_to_string(connection.throughput), "");
    assert_equal(calls, 2);
    assert_unchanged(world, () => result_assert_err(world_set_flow_connection_limit(world, connection.id, 0.5)));
});

test("une chaîne en série avec une entrée partielle réduit les autres entrées et la production", () => {
    const { world, copper_extractor, stone_extractor, furnaces: [copper_furnace, bronze_furnace] } = create_test_factory();
    result_assert_ok(world_set_machine_recipe(world, copper_furnace, "COPPER_SMELTING"));
    result_assert_ok(world_set_machine_recipe(world, bronze_furnace, "BRONZE_SMELTING"));
    const ore_belt = result_unwrap(world_connect_machines(world, copper_extractor, copper_furnace, "BELT"));
    const ingot_belt = result_unwrap(world_connect_machines(world, copper_furnace, bronze_furnace, "BELT"));
    const stone_belt = result_unwrap(world_connect_machines(world, stone_extractor, bronze_furnace, "BELT"));
    assert_equal(amounts_to_string(ore_belt.throughput), "COPPER_ORE=600");
    assert_equal(amounts_to_string(ingot_belt.throughput), "COPPER_INGOT=300");
    assert_equal(amounts_to_string(stone_belt.throughput), "STONE_ORE=100");
    assert_equal(__production(world, copper_extractor), "COPPER_ORE=1000");
    assert_equal(__production(world, copper_furnace), "COPPER_INGOT=300");
    assert_equal(__production(world, bronze_furnace), "BRONZE_INGOT=400");
});

test("un extracteur prend sa ressource dans son noeud, attend ses autres entrées et notifie sa production", () => {
    const { world, iron_extractor, water_pump, furnaces: [furnace] } = create_test_factory();
    result_assert_ok(world_set_machine_recipe(world, furnace, "IRON_SMELTING"));
    const iron_belt = result_unwrap(world_connect_machines(world, iron_extractor, furnace, "BELT"));
    assert_equal(amounts_to_string(iron_belt.throughput), "");
    assert_equal(__production(world, iron_extractor), "");
    /** @type {number[]} */
    const changed = [];
    enginesignal_on("machine.production.changed", payload => { changed.push(payload.machine_id); });
    const water_pipe = result_unwrap(world_connect_machines(world, water_pump, iron_extractor, "PIPE"));
    assert_equal(changed.join(), `${iron_extractor},${furnace}`);
    assert_equal(amounts_to_string(water_pipe.throughput), "WATER=500");
    assert_equal(amounts_to_string(iron_belt.throughput), "IRON_ORE=600");
    assert_equal(__production(world, iron_extractor), "IRON_ORE=1000");
    result_assert_ok(world_disconnect_machines(world, water_pipe.id));
    assert_equal(__production(world, iron_extractor), "");
    assert_equal(__production(world, furnace), "");
});

test("une connexion ne transporte que les ressources dont elle accepte un tag", () => {
    const { world, iron_extractor, water_pump, copper_extractor, furnaces: [copper_furnace, iron_furnace] } = create_test_factory();
    result_assert_ok(world_set_machine_recipe(world, copper_furnace, "COPPER_SMELTING"));
    result_assert_ok(world_set_machine_recipe(world, iron_furnace, "IRON_SMELTING"));
    const water_belt = result_unwrap(world_connect_machines(world, water_pump, iron_extractor, "BELT"));
    const copper_pipe = result_unwrap(world_connect_machines(world, copper_extractor, copper_furnace, "PIPE"));
    assert_equal(amounts_to_string(water_belt.throughput), "");
    assert_equal(amounts_to_string(copper_pipe.throughput), "");
    result_assert_ok(world_disconnect_machines(world, water_belt.id));
    const water_truck = result_unwrap(world_connect_machines(world, water_pump, iron_extractor, "TRUCK"));
    const iron_truck = result_unwrap(world_connect_machines(world, iron_extractor, iron_furnace, "TRUCK"));
    assert_equal(amounts_to_string(water_truck.throughput), "WATER=500");
    assert_equal(amounts_to_string(iron_truck.throughput), "IRON_ORE=600");
});

test("retirer une machine retire ses connexions et libère l'offre", () => {
    const { world, source, copper_extractor, furnaces: [first, second] } = create_test_factory();
    result_assert_ok(world_set_machine_recipe(world, first, "COPPER_SMELTING"));
    result_assert_ok(world_set_machine_recipe(world, second, "COPPER_SMELTING"));
    result_unwrap(world_connect_machines(world, copper_extractor, first, "BELT"));
    result_unwrap(world_connect_machines(world, first, second, "BELT"));
    const remaining = result_unwrap(world_connect_machines(world, copper_extractor, second, "BELT"));
    assert_equal(amounts_to_string(remaining.throughput), "COPPER_ORE=500");
    let removed = 0;
    enginesignal_on("flow_connection.removed", () => { removed++; });
    result_assert_ok(world_remove_machine(world, first));
    assert_equal(removed, 2);
    assert_equal(world.flow_connection_repo.elements.length, 1);
    assert_equal(amounts_to_string(remaining.throughput), "COPPER_ORE=600");
    assert(!source.machines.includes(first));
    result_assert_err(world_remove_machine(world, first));
});
