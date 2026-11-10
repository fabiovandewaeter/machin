// engine/machine/extractor.js

import { repository_spawn_element } from "../../utils/repository.js";

/**
 * @import {MachineKind} from "./machine.types.js"
 * @import {MaterialItemStack} from "../item/material/material_item.js"
 * @import {ExtractorID} from "../core/ids.types.js"
 * @import {RoomID} from "../core/ids.types.js"
 * @import {Repo} from "../../utils/repository.js"
 */

/**
 * @typedef {Object} Extractor
 * @prop {ExtractorID} id
 * @prop {MachineKind} kind
 * @prop {MaterialItemStack[]} extracted
 * @prop {RoomID} room_id
 *
 * @typedef {Repo<ExtractorID, Extractor>} ExtractorRepo
 */

/**
 * @param {ExtractorRepo} repo
 * @param {Object} options
 * @param {MaterialItemStack[]} options.extracted
 * @param {RoomID} options.room_id
 * @returns {Extractor}
 */
export function extractor_spawn(repo, { extracted, room_id}) {
    return repository_spawn_element(repo, {
        kind: "EXTRACTOR",
        extracted,
        room_id,
    });
}

