// ui/views/logs_view.js
// @ts-check

import '../../utils/types.js'

const MAX_RENDERED_LOGS = 10;

/**
 * @returns {string}
 */
export function render() {
    return `
    <div class="logs-view">
        <h1>Logs</h1>
        <ul class="logs-list"></ul>
    </div>
    `;
}

/**
 * @param {D<Model>|null} prev
 * @param {D<Model>} next
 */
export function update_all(prev, next) {
    if (prev?.logs === next.logs) return;

    document.querySelectorAll('ul.logs-list').forEach(
        log_list => {
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
    );
}
