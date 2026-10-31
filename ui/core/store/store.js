/** @typedef {import("./store.types.js").GameStore} GameStore */

/** @type {GameStore|undefined} */
let __store;

/** @returns {GameStore} */
export function store_get() {
    if (!__store) throw new Error("Game store is not initialized");
    return __store;
}

/** @param {GameStore} store */
export function store_set(store) {
    __store = store;
}
