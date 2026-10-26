// ui/core/signal/signal.js

/**
 * @typedef {import("./signal.types.js").UISignal} UISignal
 * @typedef {import("./signal.types.js").UISignalPayload} UISignalPayload
 */
import { signalbus_create, signalbus_clear, signalbus_on, signalbus_emit } from "../../../utils/signal_bus.js";

/**@type {import("../../../utils/signal_bus.js").SignalBus<UISignal, UISignalPayload>} */
const __UI_SIGNAL_BUS = signalbus_create();

export function uisignals_init() {
    uisignals_clear_handlers();
}

export function uisignals_clear_handlers() {
    signalbus_clear(__UI_SIGNAL_BUS);
}

/**
 * @template {UISignal} K
 * @param {K} signal_kind
 * @param {(...args: UISignalPayload[K]) => void} callback
 * @returns {() => void}
 */
export function uisignal_on(signal_kind, callback) {
    return signalbus_on(__UI_SIGNAL_BUS, signal_kind, callback);
}

/**
 * @template {UISignal} K
 * @param {K} signal_kind
 * @param {UISignalPayload[K]} args
 */
export function uisignal_emit(signal_kind, ...args) {
    signalbus_emit(__UI_SIGNAL_BUS, signal_kind, ...args);
}
