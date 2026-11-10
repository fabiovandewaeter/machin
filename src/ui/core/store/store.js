// ui/core/store/store.js

/**
 * @import {GameStore} from "./store.types.js"
 */
import { assert } from "../../../utils/assert.js";

/** @type {GameStore|undefined} */
let __store;

/** @returns {GameStore} */
export function store_get() {
    assert(__store, "Game store is not initialized");
    return __store;
}

/** @param {GameStore} store */
export function store_set(store) {
    __store = store;
}
