// engine/entity/entity.types.js

/**
 * @typedef {import("../core/ids.types.js").RoomID} RoomID
 * @typedef {import("../core/ids.types.js").EntityID} EntityID
 * @typedef {import("../item/tool/tool.js").Tool} Tool
 * @typedef {import("../item/item.types.js").Item} Item
 * @typedef {import("../inventory.js").Inventory} Inventory
 */

/**
 * @typedef {Object} Entity
 * @property {EntityID} id
 * @property {string} name
 * @property {RoomID} room_id
 * @property {Tool|undefined} tool
 * @property {Inventory} inventory
 *
 * @typedef {import("../../utils/repository.js").Repo<EntityID, Entity>} EntityRepo
 */
// TODO: classe de départ donne boost de début mais on peut tout maxer ça va juste dépendre des combinaisons qu'on fait
