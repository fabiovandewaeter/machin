// utils/signal_bus.js

import { assert } from "./assert.js";

/**
 * @template {Record<string, unknown[]>} M
 * @typedef {Object} SignalBus
 * @prop {{ [K in keyof M]?: Array<(...args: M[K]) => void> }} listeners
 * @prop {{ kind: keyof M, args: M[keyof M] }[]} pending_signals
 * @prop {number} batch_depth
 * @prop {boolean} flushing
 */

/**
 * @template {Record<string, unknown[]>} M
 * @returns {SignalBus<M>}
 */
export function signalbus_create() {
    return {
        listeners: Object.create(null),
        pending_signals: [],
        batch_depth: 0,
        flushing: false,
    };
}

/**
 * @template {Record<string, unknown[]>} M
 * @template {keyof M} K
 * @param {SignalBus<M>} bus
 * @param {K} signal_kind
 * @param {(...args: M[K]) => void} callback
 * @returns {() => void}
 */
export function signalbus_on(bus, signal_kind, callback) {
    const handlers = bus.listeners[signal_kind] ?? [];
    assert(!handlers.includes(callback), `duplicate: ${String(signal_kind)}`);
    bus.listeners[signal_kind] = [...handlers, callback];
    return () => signalbus_off(bus, signal_kind, callback);
}

/**
 * @template {Record<string, unknown[]>} M
 * @template {keyof M} K
 * @param {SignalBus<M>} bus
 * @param {K} signal_kind
 * @param {(...args: M[K]) => void} callback
 */
export function signalbus_off(bus, signal_kind, callback) {
    const handlers = bus.listeners[signal_kind];
    if (!handlers?.length) return;
    const next = handlers.filter(cb => cb !== callback);
    if (next.length === 0) delete bus.listeners[signal_kind];
    else bus.listeners[signal_kind] = next;
}

/**
 * @template {Record<string, unknown[]>} M
 * @template {keyof M} K
 * @param {SignalBus<M>} bus
 * @param {K} signal_kind
 * @param {M[K]} args
 */
export function signalbus_emit(bus, signal_kind, ...args) {
    bus.pending_signals.push({ kind: signal_kind, args });
    __signalbus_flush(bus);
}

/**
 * @template {Record<string, unknown[]>} M
 * @template T
 * @param {SignalBus<M>} bus
 * @param {() => T & (T extends PromiseLike<unknown> ? never : unknown)} operation
 * @returns {T}
 */
export function signalbus_batch(bus, operation) {
    bus.batch_depth++;
    let result;
    try {
        result = operation();
        assert(!(result && (typeof result === "object" || typeof result === "function")
            && "then" in result && typeof result.then === "function"), "Signal batches must be synchronous");
    } catch (error) {
        if (bus.batch_depth === 1) bus.pending_signals.length = 0;
        throw error;
    } finally {
        bus.batch_depth--;
    }
    __signalbus_flush(bus);
    return result;
}

/**
 * @template {Record<string, unknown[]>} M
 * @param {SignalBus<M>} bus
 */
export function signalbus_clear(bus) {
    bus.listeners = Object.create(null);
    bus.pending_signals.length = 0;
}

/**
 * @template {Record<string, unknown[]>} M
 * @param {SignalBus<M>} bus
 */
function __signalbus_flush(bus) {
    if (bus.batch_depth > 0 || bus.flushing) return;
    bus.flushing = true;
    try {
        for (const { kind, args } of bus.pending_signals) {
            __signalbus_deliver(bus, kind, args);
        }
    } finally {
        bus.pending_signals.length = 0;
        bus.flushing = false;
    }
}

/**
 * @template {Record<string, unknown[]>} M
 * @template {keyof M} K
 * @param {SignalBus<M>} bus
 * @param {K} signal_kind
 * @param {M[K]} args
 */
function __signalbus_deliver(bus, signal_kind, args) {
    const handlers = bus.listeners[signal_kind];
    if (!handlers) return;
    for (const callback of handlers) callback(...args);
}
