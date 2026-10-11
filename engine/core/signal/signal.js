// engine/core/signal/signal.js

import { signalbus_clear, signalbus_create } from "../../../utils/signal_bus.js";

/**
 * @typedef {import("./signal.types.js").EngineSignal} EngineSignal
 * @typedef {import("./signal.types.js").EngineSignalPayload} EngineSignalPayload
 */

/** @type {import("../../../utils/signal_bus.js").SignalBus<EngineSignal, EngineSignalPayload>} */
export const ESB = signalbus_create();

export function enginesignals_init() {
    enginesignals_clear_handlers();
}

export function enginesignals_clear_handlers() {
    signalbus_clear(ESB);
}
