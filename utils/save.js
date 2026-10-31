// utils/save.js

/** @template T, E @typedef {import("./result.js").Res<T, E>} Res */
import { err, ok } from "./result.js";

const __STORAGE_KEY = "machin_save";

/**
 * @param {unknown} data
 * @returns {boolean}
 */
export function save_save(data) {
    try {
        const json = JSON.stringify(data);
        if (json === undefined) throw new Error("Save data is not serializable");
        localStorage.setItem(__STORAGE_KEY, json);
        return true;
    } catch (error) {
        console.error("Could not save:", error);
        return false;
    }
}

/** @returns {Res<unknown, string>} */
export function save_load() {
    try {
        const json = localStorage.getItem(__STORAGE_KEY);
        return ok(json ? JSON.parse(json) : undefined);
    } catch (error) {
        console.error("Could not load save:", error);
        return err("Could not load save");
    }
}

/** @returns {boolean} */
export function save_clear() {
    try {
        localStorage.removeItem(__STORAGE_KEY);
        return true;
    } catch (error) {
        console.error("Could not clear save:", error);
        return false;
    }
}

/** @param {unknown} data */
export function save_download(data) {
    const json = JSON.stringify(data, null, 2);
    if (json === undefined) throw new Error("Save data is not serializable");
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "save.json";
    try {
        document.body.appendChild(link);
        link.click();
    } finally {
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }
}

/** @returns {Promise<unknown>} */
export function save_upload() {
    return new Promise(resolve => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.oncancel = () => resolve(undefined);
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) {
                resolve(undefined);
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    resolve(JSON.parse(/** @type {string} */ (reader.result)));
                } catch {
                    resolve(undefined);
                }
            };
            reader.onerror = () => resolve(undefined);
            reader.onabort = () => resolve(undefined);
            reader.readAsText(file);
        };
        input.click();
    });
}
