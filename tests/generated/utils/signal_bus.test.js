// tests/generated/utils/signal_bus.test.js

import { signalbus_batch, signalbus_clear, signalbus_create, signalbus_emit, signalbus_on } from "../../../src/utils/signal_bus.js";
import { assert_equal, assert_throws } from "../../shared/assert.js";
import { test } from "../../shared/test.js";

test("le bus livre immédiatement les arguments et permet de se désabonner", () => {
    const bus = signalbus_create();
    let calls = 0;
    const off = signalbus_on(bus, "event", value => {
        assert_equal(value, 2);
        calls++;
    });
    signalbus_emit(bus, "event", 2);
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

test("les signaux émis par un callback rejoignent la fin de la file", () => {
    const bus = signalbus_create();
    /** @type {string[]} */
    const calls = [];
    let first = true;
    signalbus_on(bus, "event", () => {
        calls.push("first");
        if (!first) return;
        first = false;
        signalbus_emit(bus, "event");
    });
    signalbus_on(bus, "event", () => calls.push("second"));
    signalbus_on(bus, "other", () => calls.push("other"));
    signalbus_batch(bus, () => {
        signalbus_emit(bus, "event");
        signalbus_emit(bus, "other");
    });
    assert_equal(calls.join(","), "first,second,other,first,second");
});

test("les batches imbriqués diffusent l'état final après l'opération extérieure sans retarder les autres bus", () => {
    const bus = signalbus_create();
    const other_bus = signalbus_create();
    let state = 0;
    /** @type {string[]} */
    const calls = [];
    signalbus_on(bus, "event", () => calls.push(`batched:${state}`));
    signalbus_on(other_bus, "event", () => calls.push("immediate"));
    const result = signalbus_batch(bus, () => {
        state = 1;
        signalbus_emit(bus, "event");
        signalbus_batch(bus, () => signalbus_emit(bus, "event"));
        signalbus_emit(other_bus, "event");
        assert_equal(calls.join(","), "immediate");
        state = 2;
        return 42;
    });
    assert_equal(result, 42);
    assert_equal(calls.join(","), "immediate,batched:2,batched:2");
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
    });
    assert_equal(calls, 1);
});

test("une erreur d'opération remonte et abandonne la file sans rollback", () => {
    const bus = signalbus_create();
    const failure = new Error("operation failed");
    let state = 0;
    let calls = 0;
    signalbus_on(bus, "event", () => calls++);
    assert_equal(assert_throws(() => signalbus_batch(bus, () => {
        state = 1;
        signalbus_emit(bus, "event");
        signalbus_batch(bus, () => {
            signalbus_emit(bus, "event");
            throw failure;
        });
    }), Error), failure);
    assert_equal(state, 1);
    assert_equal(calls, 0);
    signalbus_emit(bus, "event");
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
    });
    assert_equal(calls, 3);
});

test("une erreur de callback interrompt la livraison et nettoie la file", () => {
    const bus = signalbus_create();
    const failure = new Error("callback failed");
    let calls = 0;
    const off = signalbus_on(bus, "event", () => {
        signalbus_emit(bus, "event");
        throw failure;
    });
    signalbus_on(bus, "event", () => calls++);
    assert_equal(assert_throws(() => signalbus_batch(bus, () => {
        signalbus_emit(bus, "event");
        signalbus_emit(bus, "event");
    }), Error), failure);
    assert_equal(calls, 0);
    off();
    signalbus_emit(bus, "event");
    assert_equal(calls, 1);
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
    const bus = signalbus_create();
    let count = 0;
    signalbus_on(bus, "event", () => {
        if (++count < 20000) signalbus_emit(bus, "event");
    });
    signalbus_emit(bus, "event");
    assert_equal(count, 20000);
});
