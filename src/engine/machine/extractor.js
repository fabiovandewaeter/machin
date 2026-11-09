// engine/machine/extractor.js

import { repository_spawn_element } from "../../utils/repository.js";

/**
 * @import {MachineKind} from "./machine.types.js"
 * @import {MaterialItemStack} from "../item/material/material_item.js"
 * @import {ExtractorID} from "../core/ids.types.js"
 * @import {RoomID} from "../map/room/room.types.js"
 */

/**
 * @typedef {Object} Extractor
 * @property {ExtractorID} id
 * @property {MachineKind} kind
 * @property {MaterialItemStack[]} extracted
 * @property {RoomID} room_id
 *
 * @typedef {import("../../utils/repository.js").Repo<ExtractorID, Extractor>} ExtractorRepo
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

