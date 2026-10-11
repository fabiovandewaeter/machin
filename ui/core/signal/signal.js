// ui/core/signal/signal.js

/**
 * @typedef {import("./signal.types.js").UISignal} UISignal
 * @typedef {import("./signal.types.js").UISignalPayload} UISignalPayload
 */
import { signalbus_create, signalbus_clear } from "../../../utils/signal_bus.js";

/**@type {import("../../../utils/signal_bus.js").SignalBus<UISignal, UISignalPayload>} */
export const UISB = signalbus_create();

export function uisignals_init() {
    uisignals_clear_handlers();
}

export function uisignals_clear_handlers() {
    signalbus_clear(UISB);
}
