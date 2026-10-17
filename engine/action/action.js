// engine/action/action.js

/** @template {Record<string, unknown>} T @typedef {import("../../utils/enum.js").EnumKey<T>} EnumKey */
import { enum_create } from "../../utils/enum";

// TODO:
// miner avec des steps, déplacement etc.

// mais il faut voir pour les suites d'actions faut faire un truc différent par exemple chemin à suivre pour miner différents nodes comme dans Dofus une stack
//     -> par exemple Action[] ou une Task(ou alors les Task c'est pour le Questbook)

export const ACTION_KIND = enum_create(/**@type {const}*/([
    "MINING",
    "TRAVEL",
    "CRAFT",
]));
/**
 * @typedef {EnumKey<typeof ACTION_KIND>} ActionKind

/**
 * @typedef {Object} Action
 * @property {ActionKind} kind
 * @property {number} amount_steps
 */
