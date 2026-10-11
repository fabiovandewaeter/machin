// engine/entity/entity.types.js

/**
 * @typedef {import("../core/ids.types").RoomID} RoomID
 * @typedef {import("../core/ids.types").EntityID} EntityID
 */

/**
 * @typedef {Object} Entity
 * @property {EntityID} id
 * @property {string} name
 * @property {RoomID} room_id
 *
 * @typedef {import("../../utils/repository.js").Repo<EntityID, Entity>} EntityRepo
 */
// TODO: classe de départ donne boost de début mais on peut tout maxer ça va juste dépendre des combinaisons qu'on fait
