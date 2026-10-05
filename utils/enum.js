// utils/enum.js
// @ts-check

/**
 * Crée un enum figé où chaque valeur == sa clé (style C : Enum.FOO === "FOO").
 * @template {readonly string[]} T
 * @param {T} keys
 * @returns {Readonly<{ [K in T[number]]: K }>}
 */
export function create(keys) {
    /** @type {Record<string, string>} */
    const out = {};
    for (const k of keys) out[k] = k;
    return Object.freeze(/** @type {any} */(out));
}

/**
 * Vérifie si une valeur appartient aux valeurs d'un objet "enum".
 * @template {Record<string, unknown>} T
 * @param {T} enum_obj
 * @param {string} value 
 * @returns {value is T[keyof T]}
 */
export function is_enum_value(enum_obj, value) { return Object.values(enum_obj).includes(/** @type {T[keyof T]} */(value)); }
/**
 * Vérifie si une valeur appartient aux valeurs d'un objet "enum".
 * @template {Record<string, unknown>} T
 * @param {T} enum_obj
 * @param {string} key
 * @returns {key is keyof T & string}
 */
export function is_enum_key(enum_obj, key) { return Object.hasOwn(enum_obj, key); }

/**
 * @template {Record<string, unknown>} T
 * @param {T} enum_obj 
 * @returns {EnumKey<T>[]}
 */
export function keys(enum_obj) { return /**@type {EnumKey<T>[]} */(Object.keys(enum_obj)); }
