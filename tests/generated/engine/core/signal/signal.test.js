// tests/generated/engine/core/signal/signal.test.js

import { signalbus_batch, signalbus_clear, signalbus_create, signalbus_emit, signalbus_on } from "../../../../../src/utils/signal_bus.js";
import { enginesignal_emit, enginesignal_on, enginesignals_batch } from "../../../../../src/engine/core/signal/signal.js";
import { assert_equal, assert_throws } from "../../../../shared/assert.js";
import { test } from "../../../../shared/test.js";

test("le bus livre immédiatement les arguments et permet de se désabonner", () => {
    const bus = signalbus_create();
    let calls = 0;
    const off = signalbus_on(bus, "event", value => {
        assert_equal(value, 2);
        calls++;
    });
    signalbus_emit(bus, "event", 2);
    assert_equal(calls, 1);
    off();
    signalbus_emit(bus, "event", 2);
    assert_equal(calls, 1);
});

test("les abonnements modifiés pendant une livraison prennent effet à la suivante", () => {
    const bus = signalbus_create();
    /** @type {string[]} */
    const calls = [];
    const off_first = signalbus_on(bus, "event", () => {
        calls.push("first");
        off_first();
        off_second();
        signalbus_on(bus, "event", () => calls.push("new"));
    });
    const off_second = signalbus_on(bus, "event", () => calls.push("second"));
    signalbus_emit(bus, "event");
    signalbus_emit(bus, "event");
    assert_equal(calls.join(","), "first,second,new");
});

test("les signaux émis par un callback sont livrés après les callbacks en cours", () => {
    const bus = signalbus_create();
    /** @type {string[]} */
    const calls = [];
    signalbus_on(bus, "event", () => {
        calls.push("first");
        signalbus_emit(bus, "nested");
    });
    signalbus_on(bus, "event", () => calls.push("second"));
    signalbus_on(bus, "nested", () => calls.push("nested"));
    signalbus_emit(bus, "event");
    assert_equal(calls.join(","), "first,second,nested");
});

test("le batch d'un bus ne retarde pas les notifications d'un autre bus", () => {
    const bus = signalbus_create();
    const other_bus = signalbus_create();
    /** @type {string[]} */
    const calls = [];
    signalbus_on(bus, "event", () => calls.push("batched"));
    signalbus_on(other_bus, "event", () => calls.push("immediate"));
    const result = signalbus_batch(bus, () => {
        signalbus_emit(bus, "event");
        signalbus_batch(bus, () => signalbus_emit(bus, "event"));
        signalbus_emit(other_bus, "event");
        assert_equal(calls.join(","), "immediate");
        return 42;
    });
    assert_equal(result, 42);
    assert_equal(calls.join(","), "immediate,batched,batched");
});

test("effacer un bus pendant un batch abandonne ses notifications en attente", () => {
    const bus = signalbus_create();
    let calls = 0;
    signalbus_on(bus, "event", () => calls++);
    signalbus_batch(bus, () => {
        signalbus_emit(bus, "event");
        signalbus_clear(bus);
        signalbus_on(bus, "event", () => calls++);
        signalbus_emit(bus, "event");
        assert_equal(calls, 0);
    });
    assert_equal(calls, 1);
});

test("les batches imbriqués diffusent uniquement après l'opération extérieure", () => {
    let state = 0;
    /** @type {number[]} */
    const observed = [];
    enginesignal_on("TICK", () => observed.push(state));
    const result = enginesignals_batch(() => {
        state = 1;
        enginesignal_emit("TICK");
        enginesignals_batch(() => {
            state = 2;
            enginesignal_emit("TICK");
        });
        assert_equal(observed.length, 0);
        state = 3;
        return 42;
    });
    assert_equal(result, 42);
    assert_equal(observed.join(","), "3,3");
});

test("les signaux émis par un callback rejoignent la fin de la file", () => {
    /** @type {string[]} */
    const calls = [];
    let first = true;
    enginesignal_on("TICK", () => {
        calls.push("first");
        if (first) {
            first = false;
            enginesignal_emit("TICK");
        }
    });
    enginesignal_on("TICK", () => calls.push("second"));
    enginesignal_on("room.exits.set", () => calls.push("other"));
    enginesignals_batch(() => {
        enginesignal_emit("TICK");
        enginesignal_emit("room.exits.set", {
            room_id: /** @type {import("../../../../../src/engine/core/ids.types.js").RoomID} */ (0),
            key: "exit",
        });
    });
    assert_equal(calls.join(","), "first,second,other,first,second");
});

test("une erreur d'opération remonte et abandonne la file sans rollback", () => {
    const failure = new Error("operation failed");
    let state = 0;
    let calls = 0;
    enginesignal_on("TICK", () => calls++);
    assert_equal(assert_throws(() => enginesignals_batch(() => {
        state = 1;
        enginesignal_emit("TICK");
        enginesignals_batch(() => {
            enginesignal_emit("TICK");
            throw failure;
        });
    }), Error), failure);
    assert_equal(state, 1);
    assert_equal(calls, 0);
    enginesignal_emit("TICK");
    assert_equal(calls, 1);
});

test("une erreur de callback interrompt la livraison et nettoie la file", () => {
    const failure = new Error("callback failed");
    let calls = 0;
    const off = enginesignal_on("TICK", () => {
        enginesignal_emit("TICK");
        throw failure;
    });
    enginesignal_on("TICK", () => calls++);
    assert_equal(assert_throws(() => enginesignals_batch(() => {
        enginesignal_emit("TICK");
        enginesignal_emit("TICK");
    }), Error), failure);
    assert_equal(calls, 0);
    off();
    enginesignal_emit("TICK");
    assert_equal(calls, 1);
});

test("une erreur imbriquée interceptée conserve les signaux du batch extérieur", () => {
    const bus = signalbus_create();
    const failure = new Error("nested failure");
    let calls = 0;
    signalbus_on(bus, "event", () => calls++);
    signalbus_batch(bus, () => {
        signalbus_emit(bus, "event");
        try {
            signalbus_batch(bus, () => {
                signalbus_emit(bus, "event");
                throw failure;
            });
        } catch (error) {
            assert_equal(error, failure);
        }
        signalbus_emit(bus, "event");
        assert_equal(calls, 0);
    });
    assert_equal(calls, 3);
});

test("un retour asynchrone est refusé sans diffuser les notifications en attente", () => {
    const bus = signalbus_create();
    let calls = 0;
    signalbus_on(bus, "event", () => calls++);
    const operation = /** @type {() => never} */ (/** @type {unknown} */ (() => {
        signalbus_emit(bus, "event");
        return Promise.resolve();
    }));
    assert_throws(() => signalbus_batch(bus, operation), Error, "Signal batches must be synchronous");
    assert_equal(calls, 0);
    signalbus_batch(bus, () => signalbus_emit(bus, "event"));
    assert_equal(calls, 1);
});

test("une chaîne finie de signaux ne fait pas de récursion et n'est pas tronquée", () => {
    let count = 0;
    enginesignal_on("TICK", () => {
        if (++count < 20000) enginesignal_emit("TICK");
    });
    enginesignal_emit("TICK");
    assert_equal(count, 20000);
});
