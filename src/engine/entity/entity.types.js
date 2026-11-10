// engine/entity/entity.types.js

/**
 * @import {RoomID} from "../core/ids.types.js"
 * @import {EntityID} from "../core/ids.types.js"
 * @import {Tool} from "../item/tool/tool.js"
 * @import {InventoryID} from "../core/ids.types.js"
 * @import {Repo} from "../../utils/repository.js"
 */

/**
 * @typedef {Object} Entity
 * @prop {EntityID} id
 * @prop {string} name
 * @prop {RoomID} room_id
 * @prop {Tool|undefined} tool
 * @prop {InventoryID} inventory_id
 *
 * @typedef {Repo<EntityID, Entity>} EntityRepo
 */
// TODO: classe de départ donne boost de début mais on peut tout maxer ça va juste dépendre des combinaisons qu'on fait
