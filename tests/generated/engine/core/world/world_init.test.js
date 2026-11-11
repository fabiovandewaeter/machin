// tests/generated/engine/core/world/world_init.test.js

import { enginesignal_on } from "../../../../../src/engine/core/signal/signal.js";
import { world_create } from "../../../../../src/engine/core/world/world.js";
import { world_init } from "../../../../../src/engine/core/world/world_init.js";
import { array_get } from "../../../../../src/utils/array.js";
import { assert, assert_equal, assert_throws } from "../../../../shared/assert.js";
import { amounts_to_string, create_test_store } from "../../../../shared/fixtures.js";
import { test } from "../../../../shared/test.js";

test("initialiser le monde termine toutes les entités et leurs inventaires avant notification", () => {
    const world = world_create({ now: 0, seed: 1 });
    let calls = 0;
    enginesignal_on("room.exits.set", () => {
        assert_equal(world.entity_repo.elements.length, 2);
        assert_equal(world.inventory_repo.elements.length, 2);
        assert_equal(array_get(world.galaxy.room_repo.elements, 0).entities.length, 2);
        assert_equal(array_get(world.inventory_repo.elements, 0).item_stack.length, 1);
        calls++;
    });
    world_init(world);
    assert_equal(calls, world.galaxy.room_repo.elements.reduce((sum, room) => sum + Object.keys(room.exits).length, 0));
    assert_throws(() => world_init(world), Error, "World is already initialized");
});

test("la seed détermine le monde généré", () => {
    const first = world_create({ now: 0, seed: 42 });
    const same_seed = world_create({ now: 0, seed: 42 });
    const other_seed = world_create({ now: 0, seed: 43 });
    world_init(first);
    world_init(same_seed);
    world_init(other_seed);
    assert_equal(JSON.stringify(first), JSON.stringify(same_seed));
    assert(JSON.stringify(first.galaxy) !== JSON.stringify(other_seed.galaxy));
});

test("le monde de départ contient une usine d'exemple branchée et cohérente", () => {
    const { world, factory_room } = create_test_store();
    assert_equal(factory_room.machines.length, 7);
    assert(world.machine_repo.elements.every(machine => machine.recipe_id !== undefined));
    assert_equal(world.flow_connection_repo.elements.map(connection => `${connection.kind}:${amounts_to_string(connection.throughput)}`).join(";"),
        "BELT:COPPER_ORE=600;BELT:COPPER_INGOT=300;BELT:STONE_ORE=100;PIPE:WATER=500;TRUCK:IRON_ORE=400");
    assert_equal(world.machine_repo.elements.map(machine => amounts_to_string(machine.production)).join(";"),
        "STONE_ORE=1000;COPPER_ORE=1000;IRON_ORE=1000;WATER=2000;COPPER_INGOT=300;IRON_INGOT=200;BRONZE_INGOT=400");
});
