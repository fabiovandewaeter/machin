// engine/entity/entity.types.js

/**
 * @typedef {import("../core/ids.types.js").RoomID} RoomID
 * @typedef {import("../core/ids.types.js").EntityID} EntityID
 * @typedef {import("../item/tool/tool.js").Tool} Tool
 * @typedef {import("../core/ids.types.js").InventoryID} InventoryID
 */

/**
 * @typedef {Object} Entity
 * @prop {EntityID} id
 * @prop {string} name
 * @prop {RoomID} room_id
 * @prop {Tool|undefined} tool
 * @prop {InventoryID} inventory_id
 *
 * @typedef {import("../../utils/repository.js").Repo<EntityID, Entity>} EntityRepo
 */
// TODO: classe de départ donne boost de début mais on peut tout maxer ça va juste dépendre des combinaisons qu'on fait
