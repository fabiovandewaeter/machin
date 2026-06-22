// ui/views/controls_view.js
// @ts-check

import '../../utils/types.js'
import { SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_WEEK, SECONDS_PER_YEAR } from '../../utils/const.js'

/**
 * @returns {string}
 */
export function render() {
    return `
    <div class="controls-view">
        <div class="controls-time">
            <button data-msg-type="skip_seconds" data-amount=1000>1 seconde</button>
            <button data-msg-type="skip_seconds" data-amount=${SECONDS_PER_MINUTE * 1000}>1 minute</button>
            <button data-msg-type="skip_seconds" data-amount=${SECONDS_PER_HOUR * 1000}>1 heure</button>
            <button data-msg-type="skip_seconds" data-amount=${SECONDS_PER_DAY * 1000}>1 jour</button>
            <button data-msg-type="skip_seconds" data-amount=${SECONDS_PER_WEEK * 1000}>1 semaine</button>
            <button data-msg-type="skip_seconds" data-amount=${SECONDS_PER_YEAR * 1000}>1 an</button>
        </div>

        <button data-msg-type="start_stop_tick_interval">Start</button>

        <button data-msg-type="stop_main">Stop main</button>

        <div class="controls-direction">
            <button data-msg-type="direction" data-direction="NORTH">Nord</button>
            <button data-msg-type="direction" data-direction="SOUTH">Sud</button>
            <button data-msg-type="direction" data-direction="EAST">Est</button>
            <button data-msg-type="direction" data-direction="WEST">Ouest</button>
        </div>
        <div class="controls-movement">
            <button data-msg-type="movement" data-delta="0,1,0">devant</button>
            <button data-msg-type="movement" data-delta="0,-1,0">derrière</button>
            <button data-msg-type="movement" data-delta="1,0,0">droite</button>
            <button data-msg-type="movement" data-delta="-1,0,0">gauche</button>

            <button data-msg-type="movement" data-delta="0,0,1">haut</button>
            <button data-msg-type="movement" data-delta="0,0,-1">bas</button>
        </div>
    </div>
    `;
}

/**
 * @param {DeepReadonly<Model>|null} prev
 * @param {DeepReadonly<Model>} next
 */
export function update_all(prev, next) {
    if (prev?.tick_interval_id === next.tick_interval_id) return;

    document.querySelectorAll('.controls-view').forEach(
        control => {
            const button = control.querySelector('[data-msg-type="start_stop_tick_interval"]');
            if (!button) throw new Error();
            if (next.tick_interval_id === null) {
                button.textContent = "Start";
            }
            else {
                button.textContent = "Stop";
            }
        }
    )
}
