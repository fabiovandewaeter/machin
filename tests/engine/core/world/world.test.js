// tests/engine/core/world/world.test.js

import { enginesignal_on } from "../../../../src/engine/core/signal/signal.js";
import { world_create, world_mine, world_move_entity, world_spawn_entity } from "../../../../src/engine/core/world/world.js";
import { world_init } from "../../../../src/engine/core/world/world_init.js";
import { galaxy_create, galaxy_init } from "../../../../src/engine/map/galaxy.js";
import { materialitem_create } from "../../../../src/engine/item/material/material_item.js";
import { array_get } from "../../../../src/utils/array.js";
import { assert, assert_equal, assert_throws } from "../../../../src/utils/assert.js";
import { repository_get } from "../../../../src/utils/repository.js";
import { result_assert_err, result_assert_ok } from "../../../../src/utils/result.js";
import { undefined_unwrap } from "../../../../src/utils/undefined.js";
import { create_test_world } from "../../../fixtures.js";
import { test } from "../../../test.js";

test("initialiser la galaxie termine les sorties réciproques avant notification", () => {
    const galaxy = galaxy_create();
    let calls = 0;
    const off = enginesignal_on("room.exits.set", () => {
        assert_equal(galaxy.room_repo.elements.length, 2);
        for (const room of galaxy.room_repo.elements) {
            assert_equal(Object.keys(room.exits).length, 1);
        }
        calls++;
    });
    try {
        galaxy_init(galaxy);
        assert_equal(calls, 2);
    } finally {
        off();
    }
});

test("initialiser le monde termine toutes les entités et leurs inventaires avant notification", () => {
    const world = world_create();
    let calls = 0;
    const off = enginesignal_on("room.exits.set", () => {
        assert_equal(world.entity_repo.elements.length, 2);
        assert_equal(world.inventory_repo.elements.length, 2);
        assert_equal(array_get(world.galaxy.room_repo.elements, 0).entities.length, 2);
        assert_equal(array_get(world.inventory_repo.elements, 0).item_stack.length, 1);
        calls++;
    });
    try {
        world_init(world);
        assert_equal(calls, 2);
    } finally {
        off();
    }
});

test("le spawn crée un inventaire et inscrit l'entité dans sa salle avant notification", () => {
    const { world, source } = create_test_world();
    let observed = false;
    const off = enginesignal_on("room.entities.added", payload => {
        const entity = undefined_unwrap(repository_get(world.entity_repo, payload.added));
        assert_equal(entity.room_id, payload.room_id);
        assert(repository_get(world.inventory_repo, entity.inventory_id) !== undefined);
        assert(source.entities.includes(entity.id));
        observed = true;
    });
    try {
        world_spawn_entity(world, { name: "second", room_id: source.id });
        assert(observed);
    } finally {
        off();
    }
});

test("un déplacement notifie uniquement après synchronisation des deux salles", () => {
    const { world, source, destination, entity } = create_test_world();
    let observed = false;
    const off = enginesignal_on("entity.room_id.changed", () => {
        assert_equal(entity.room_id, destination.id);
        assert(!source.entities.includes(entity.id));
        assert(destination.entities.includes(entity.id));
        observed = true;
    });
    try {
        result_assert_ok(world_move_entity(world, entity.id, destination.id));
        assert(observed);
    } finally {
        off();
    }
});

test("une destination sans sortie est refusée sans mutation", () => {
    const { world, entity, isolated } = create_test_world();
    const before = JSON.stringify(world);
    result_assert_err(world_move_entity(world, entity.id, isolated.id));
    assert_equal(JSON.stringify(world), before);
});

test("un spawn impossible ne laisse pas d'inventaire orphelin", () => {
    const { world, source } = create_test_world();
    const inventory_count = world.inventory_repo.elements.length;
    world.entity_repo.current_id = /** @type {import("../../../../src/engine/core/ids.types.js").EntityID} */ (Number.MAX_SAFE_INTEGER);
    assert_throws(() => world_spawn_entity(world, { name: "overflow", room_id: source.id }));
    assert_equal(world.inventory_repo.elements.length, inventory_count);
});

test("le minage livre des objets indépendants et retire le minerai avant notification", () => {
    const { world, entity, source, ore } = create_test_world();
    const inventory = undefined_unwrap(repository_get(world.inventory_repo, entity.inventory_id));
    let calls = 0;
    const off = enginesignal_on("inventory.item_stack.added", () => {
        assert_equal(source.content.length, 0);
        assert_equal(inventory.item_stack.length, 2);
        calls++;
    });
    try {
        const result = world_mine(world, entity.id, ore.internal_id);
        result_assert_ok(result);
        assert_equal(calls, 2);
        const first = array_get(inventory.item_stack, 0).item;
        const second = array_get(inventory.item_stack, 1).item;
        assert(first !== second);
        assert(first !== array_get(ore.composition, 0).material_item);
        assert(first !== array_get(result.value, 0).material_item);
        if (first.kind === "PICKAXE" || second.kind === "PICKAXE") throw new Error("Expected material items");
        first.durability = 1;
        assert(second.durability > 1);
        assert(array_get(ore.composition, 0).material_item.durability > 1);
    } finally {
        off();
    }
});

test("un outil insuffisant laisse le minerai et l'inventaire intacts", () => {
    const { world, entity, ore } = create_test_world();
    array_get(ore.composition, 0).material_item = materialitem_create({ kind: "ORE", material: "IRON", quality: "NORMAL" });
    ore.required_mining_level = 2;
    const before = JSON.stringify(world);
    result_assert_err(world_mine(world, entity.id, ore.internal_id));
    assert_equal(JSON.stringify(world), before);
});

test("un inventaire saturé refuse tout le minage avant mutation", () => {
    const { world, entity, ore } = create_test_world();
    const inventory = undefined_unwrap(repository_get(world.inventory_repo, entity.inventory_id));
    inventory.__current_intenal_item_id = /** @type {import("../../../../src/engine/inventory/inventory.types.js").__InternalItemID} */ (Number.MAX_SAFE_INTEGER - 1);
    const before = JSON.stringify(world);
    result_assert_err(world_mine(world, entity.id, ore.internal_id));
    assert_equal(JSON.stringify(world), before);
});
