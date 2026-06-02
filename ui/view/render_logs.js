// @ts-check
// ui/view/render_logs.js

import '../types.js';

const MAX_RENDERED_LOGS = 20;

/**
 * @param {Model|null} prev
 * @param {Model} next 
 */
export function render_logs(prev, next) {
    const log_list = document.getElementById('log-list')
    if (!log_list) throw new Error();
    if (prev?.logs === next.logs) return;

    const logs_to_add = next.logs.slice(prev?.logs.length);
    logs_to_add.forEach(log => {
        const li = document.createElement('li');
        li.textContent = log;
        log_list.appendChild(li);
    })

    const rendered_logs = log_list.children.length;
    if (rendered_logs > MAX_RENDERED_LOGS) {
        const to_remove = rendered_logs - MAX_RENDERED_LOGS;
        for (let i = 0; i < to_remove; i++) {
            const first = log_list.firstChild;
            if (first === null) throw new Error();
            log_list.removeChild(first);
        }
    }
}
