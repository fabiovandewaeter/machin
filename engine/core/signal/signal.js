// engine/core/signal/signal.js

import { signalbus_clear, signalbus_create, signalbus_emit, signalbus_on } from "../../../utils/signal_bus.js";

/**
 * @typedef {import("./signal.types.js").EngineSignal} EngineSignal
 * @typedef {import("./signal.types.js").EngineSignalPayload} EngineSignalPayload
 */

/** @type {import("../../../utils/signal_bus.js").SignalBus<EngineSignal, EngineSignalPayload>} */
const __ENGINE_SIGNAL_BUS = signalbus_create();

/** @type {{ kind: EngineSignal, args: EngineSignalPayload[EngineSignal] }[]} */
const __PENDING_SIGNALS = [];
let __batch_depth = 0;
let __flushing = false;

export function enginesignals_init() {
    enginesignals_clear_handlers();
}

export function enginesignals_clear_handlers() {
    signalbus_clear(__ENGINE_SIGNAL_BUS);
}

/**
 * @template {EngineSignal} K
 * @param {K} signal_kind
 * @param {(...args: EngineSignalPayload[K]) => void} callback
 * @returns {() => void}
 */
export function enginesignal_on(signal_kind, callback) {
    return signalbus_on(__ENGINE_SIGNAL_BUS, signal_kind, callback);
}

/**
 * @template {EngineSignal} K
 * @param {K} signal_kind
 * @param {EngineSignalPayload[K]} args
 */
export function enginesignal_emit(signal_kind, ...args) {
    __PENDING_SIGNALS.push({ kind: signal_kind, args });
    __enginesignals_flush();
}

/**
 * @template T
 * @param {() => T} operation
 * @returns {T}
 */
export function enginesignals_batch(operation) {
    __batch_depth++;
    let result;
    try {
        result = operation();
    } catch (error) {
        __PENDING_SIGNALS.length = 0;
        throw error;
    } finally {
        __batch_depth--;
    }
    __enginesignals_flush();
    return result;
}

function __enginesignals_flush() {
    if (__batch_depth > 0 || __flushing) return;
    __flushing = true;
    try {
        for (const { kind, args } of __PENDING_SIGNALS) {
            signalbus_emit(__ENGINE_SIGNAL_BUS, kind, ...args);
        }
    } finally {
        __PENDING_SIGNALS.length = 0;
        __flushing = false;
    }
}
