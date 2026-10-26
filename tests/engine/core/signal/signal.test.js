import { assert, assert_equal } from "../../../../utils/assert.js";
import { signalbus_create, signalbus_emit, signalbus_on } from "../../../../utils/signal_bus.js";
import { enginesignal_emit, enginesignal_on, enginesignals_batch, enginesignals_clear_handlers } from "../../../../engine/core/signal/signal.js";
import { test } from "../../../test.js";

/** @param {() => void} operation @param {Error} expected */
function assert_throws(operation, expected) {
    try {
        operation();
    } catch (error) {
        assert_equal(error, expected);
        return;
    }
    assert(false, "Expected an exception");
}

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

test("les batches imbriqués diffusent uniquement après l'opération extérieure", () => {
    enginesignals_clear_handlers();
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
    enginesignals_clear_handlers();
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
    enginesignal_on("ENTITY_BROKE", () => calls.push("other"));
    enginesignals_batch(() => {
        enginesignal_emit("TICK");
        enginesignal_emit("ENTITY_BROKE", {
            entity_id: /** @type {import("../../../../engine/core/ids.types.js").EntityID} */ (0),
        });
    });
    assert_equal(calls.join(","), "first,second,other,first,second");
});

test("une erreur d'opération remonte et abandonne la file sans rollback", () => {
    enginesignals_clear_handlers();
    const failure = new Error("operation failed");
    let state = 0;
    let calls = 0;
    enginesignal_on("TICK", () => calls++);
    assert_throws(() => enginesignals_batch(() => {
        state = 1;
        enginesignal_emit("TICK");
        enginesignals_batch(() => {
            enginesignal_emit("TICK");
            throw failure;
        });
    }), failure);
    assert_equal(state, 1);
    assert_equal(calls, 0);
    enginesignal_emit("TICK");
    assert_equal(calls, 1);
});

test("une erreur de callback interrompt la livraison et nettoie la file", () => {
    enginesignals_clear_handlers();
    const failure = new Error("callback failed");
    let calls = 0;
    const off = enginesignal_on("TICK", () => {
        enginesignal_emit("TICK");
        throw failure;
    });
    enginesignal_on("TICK", () => calls++);
    assert_throws(() => enginesignals_batch(() => {
        enginesignal_emit("TICK");
        enginesignal_emit("TICK");
    }), failure);
    assert_equal(calls, 0);
    off();
    enginesignal_emit("TICK");
    assert_equal(calls, 1);
});

test("une chaîne finie de signaux ne fait pas de récursion et n'est pas tronquée", () => {
    enginesignals_clear_handlers();
    let count = 0;
    enginesignal_on("TICK", () => {
        if (++count < 20000) enginesignal_emit("TICK");
    });
    enginesignal_emit("TICK");
    assert_equal(count, 20000);
});

enginesignals_clear_handlers();
