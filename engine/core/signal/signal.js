// engine/core/signal/signal.js

import { signalbus_clear, signalbus_create, signalbus_emit, signalbus_on } from "../../../utils/signal_bus.js";

/**
 * @typedef {import("./signal.types.js").EngineSignal} EngineSignal
 * @typedef {import("./signal.types.js").EngineSignalPayload} EngineSignalPayload
 */

/** @type {import("../../../utils/signal_bus.js").SignalBus<EngineSignal, EngineSignalPayload>} */
export const __ESB = signalbus_create();

export function enginesignals_init() {
    enginesignals_clear_handlers();
}

export function enginesignals_clear_handlers() {
    signalbus_clear(__ESB);
}

/**
 * @template {EngineSignal} K
 * @param {K} signal_kind
 * @param {(...args: EngineSignalPayload[K]) => void} callback
 * @returns {() => void}
 */
export function enginesignal_on(signal_kind, callback) {
    return signalbus_on(__ESB, signal_kind, callback);
}

/**
 * @template {EngineSignal} K
 * @param {K} signal_kind
 * @param {EngineSignalPayload[K]} args
 */
export function enginesignal_emit(signal_kind, ...args) {
    signalbus_emit(__ESB, signal_kind, ...args);
}
