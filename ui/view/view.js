// @ts-nocheck
// ui/view/view.js

import { render_controls } from "./render_controls.js";
import { render_logs } from "./render_logs.js";
import { render_time } from "./render_time.js";

/**
 * @param {Model|null} prev
 * @param {Model} next 
 */
export function view(prev, next) {
    render_controls(prev, next);
    render_logs(prev, next);
    render_time(prev, next);
}
