// tests/generated/engine/core/world/world.test.js

import { enginesignal_on } from "../../../../../src/engine/core/signal/signal.js";
import { world_connect_machines, world_disconnect_machines, world_mine, world_move_entity, world_place_machine, world_spawn_entity } from "../../../../../src/engine/core/world/world.js";
import { materialitem_create } from "../../../../../src/engine/item/material/material_item.js";
import { array_get } from "../../../../../src/utils/array.js";
import { repository_get } from "../../../../../src/utils/repository.js";
import { result_assert_err, result_assert_ok, result_unwrap } from "../../../../../src/utils/result.js";
import { undefined_unwrap } from "../../../../../src/utils/undefined.js";
import { assert, assert_equal, assert_throws, assert_unchanged } from "../../../../shared/assert.js";
import { create_test_factory, create_test_world } from "../../../../shared/fixtures.js";
import { test } from "../../../../shared/test.js";

test("le spawn crée un inventaire et inscrit l'entité dans sa salle avant notification", () => {
    const { world, source } = create_test_world();
    let observed = false;
    enginesignal_on("room.entities.added", payload => {
        const entity = undefined_unwrap(repository_get(world.entity_repo, payload.added));
        assert_equal(entity.room_id, payload.room_id);
        assert(repository_get(world.inventory_repo, entity.inventory_id) !== undefined);
        assert(source.entities.includes(entity.id));
        observed = true;
    });
    world_spawn_entity(world, { name: "second", room_id: source.id });
    assert(observed);
});

test("un spawn impossible ou avec un outil invalide est refusé sans mutation", () => {
    const { world, source } = create_test_world();
    const tool = /** @type {import("../../../../../src/engine/item/tool/tool.js").Tool} */ (/** @type {unknown} */ ({ kind: "PICKAXE" }));
    assert_unchanged(world, () => assert_throws(() => world_spawn_entity(world, { name: "broken", room_id: source.id, tool }), Error, "Invalid tool"));
    world.entity_repo.current_id = /** @type {import("../../../../../src/engine/core/ids.types.js").EntityID} */ (Number.MAX_SAFE_INTEGER);
    assert_unchanged(world, () => assert_throws(() => world_spawn_entity(world, { name: "overflow", room_id: source.id }), Error, "Repository ID limit reached"));
});

test("un déplacement notifie uniquement après synchronisation des deux salles", () => {
    const { world, source, destination, entity } = create_test_world();
    let observed = false;
    enginesignal_on("entity.room_id.changed", () => {
        assert_equal(entity.room_id, destination.id);
        assert(!source.entities.includes(entity.id));
        assert(destination.entities.includes(entity.id));
        observed = true;
    });
    result_assert_ok(world_move_entity(world, entity.id, destination.id));
    assert(observed);
});

test("une destination sans sortie est refusée sans mutation", () => {
    const { world, entity, isolated } = create_test_world();
    assert_unchanged(world, () => result_assert_err(world_move_entity(world, entity.id, isolated.id)));
});

test("le minage ajoute un stack par matériau en un seul signal et retire le minerai avant notification", () => {
    const { world, entity, source, ore } = create_test_world();
    const inventory = undefined_unwrap(repository_get(world.inventory_repo, entity.inventory_id));
    let calls = 0;
    enginesignal_on("inventory.item_stack.added", () => {
        assert_equal(source.content.length, 0);
        assert_equal(inventory.item_stack.length, 1);
        calls++;
    });
    result_assert_ok(world_mine(world, entity.id, ore.internal_id));
    assert_equal(calls, 1);
    const stack = array_get(inventory.item_stack, 0);
    assert_equal(stack.amount, 2);
    assert_equal(stack.item, array_get(ore.composition, 0).material_item);
});

test("un minage impossible laisse le minerai et l'inventaire intacts", () => {
    const { world, entity, ore } = create_test_world();
    const inventory = undefined_unwrap(repository_get(world.inventory_repo, entity.inventory_id));
    inventory.__current_internal_item_id = /** @type {import("../../../../../src/engine/inventory/inventory.types.js").__InternalItemID} */ (Number.MAX_SAFE_INTEGER);
    assert_unchanged(world, () => result_assert_err(world_mine(world, entity.id, ore.internal_id)));
    inventory.__current_internal_item_id = /** @type {import("../../../../../src/engine/inventory/inventory.types.js").__InternalItemID} */ (0);
    array_get(ore.composition, 0).material_item = materialitem_create({ kind: "ORE", material: "IRON", quality: "NORMAL" });
    ore.required_mining_level = 2;
    assert_unchanged(world, () => result_assert_err(world_mine(world, entity.id, ore.internal_id)));
});

test("le placement des machines respecte les noeuds et un noeud utilisé ne peut pas être miné", () => {
    const { world, source, destination, entity, ore } = create_test_factory();
    assert_unchanged(world, () => {
        result_assert_err(world_place_machine(world, { kind: "EXTRACTOR", room_id: source.id }));
        result_assert_err(world_place_machine(world, { kind: "EXTRACTOR", room_id: source.id, node_id: ore.internal_id }));
        result_assert_err(world_place_machine(world, { kind: "EXTRACTOR", room_id: destination.id, node_id: ore.internal_id }));
        result_assert_err(world_place_machine(world, { kind: "FURNACE", room_id: source.id, node_id: ore.internal_id }));
        result_assert_err(world_mine(world, entity.id, ore.internal_id));
    });
    let added = 0;
    enginesignal_on("room.machines.added", payload => {
        assert(source.machines.includes(payload.added));
        added++;
    });
    result_unwrap(world_place_machine(world, { kind: "FURNACE", room_id: source.id }));
    assert_equal(added, 1);
});

test("connecter puis déconnecter des machines notifie avec l'identifiant de la connexion", () => {
    const { world, copper_extractor, furnaces: [furnace] } = create_test_factory();
    /** @type {number[]} */
    const added = [];
    /** @type {number[]} */
    const removed = [];
    enginesignal_on("flow_connection.added", payload => { added.push(payload.flow_connection_id); });
    enginesignal_on("flow_connection.removed", payload => { removed.push(payload.flow_connection_id); });
    const connection = result_unwrap(world_connect_machines(world, copper_extractor, furnace, "BELT"));
    assert_equal(added.join(), String(connection.id));
    result_assert_ok(world_disconnect_machines(world, connection.id));
    assert_equal(removed.join(), String(connection.id));
    assert_equal(world.flow_connection_repo.elements.length, 0);
    result_assert_err(world_disconnect_machines(world, connection.id));
});

test("les connexions invalides ou créant un cycle sont refusées sans mutation", () => {
    const { world, furnaces: [a, b, c] } = create_test_factory();
    result_unwrap(world_connect_machines(world, a, b, "BELT"));
    result_unwrap(world_connect_machines(world, b, c, "BELT"));
    assert_unchanged(world, () => {
        result_assert_err(world_connect_machines(world, a, a, "BELT"));
        result_assert_err(world_connect_machines(world, a, b, "PIPE"));
        result_assert_err(world_connect_machines(world, b, a, "BELT"));
        result_assert_err(world_connect_machines(world, c, a, "BELT"));
        result_assert_err(world_connect_machines(world, a, /** @type {never} */ (999), "BELT"));
        result_assert_err(world_connect_machines(world, a, c, /** @type {never} */ ("UNKNOWN")));
    });
});
