// utils/save.js
// @ts-check
const STORAGE_KEY = 'machin_save';

import './types.js'
import * as Opt from './option.js'

/**
 * @param {D<Model>} model 
 */
export function save(model) {
    try {
        const json = JSON.stringify(model);
        localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
        console.error('Could not save:', e);
    }
}

/**
 * @returns {Opt<Model>}
 */
export function load() {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? Opt.some(JSON.parse(json)) : Opt.none;
    } catch (e) {
        console.error('Could not load save:', e);
        localStorage.removeItem(STORAGE_KEY);
        return Opt.none;
    }
}

export function clear() {
    console.log(localStorage.getItem(STORAGE_KEY));
    localStorage.removeItem(STORAGE_KEY);
    console.log(localStorage.getItem(STORAGE_KEY));
}

/**
 * @param {D<Model>} model 
 */
export function download(model) {
    const json = JSON.stringify(model, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'save.json';
    document.body.appendChild(a);
    a.click();
    document.removeChild(a);
    URL.revokeObjectURL(url);
}

export function upload() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target?.files[0];
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const model = JSON.parse(/**@type {string}*/(event.target?.result));
                    // TODO: valider que les champs sont bons
                    resolve(model);
                } catch (err) {
                    console.error('Fichier invalide');
                    resolve(null);
                }
            };
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
        };
        input.click();
    });
}
