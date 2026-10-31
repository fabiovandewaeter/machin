// engine/map/parent_ref.js

/**
 * @typedef {Object} StarSystemParent
 * @property {'SYSTEM'} kind
 * @property {import("../core/ids.types.js").StarSystemID} id
 * 
 * @typedef {Object} CelestialBodyParent
 * @property {'CELESTIAL_BODY'} kind
 * @property {import("../core/ids.types.js").CelestialBodyID} id
 * 
 * @typedef {Object} RegionParent
 * @property {'REGION'} kind
 * @property {import("../core/ids.types.js").RegionID} id
 * 
 * @typedef {Object} AreaParent
 * @property {'AREA'} kind
 * @property {import("../core/ids.types.js").AreaID} id
 * 
 * @typedef {
 *      | StarSystemParent
 *      | CelestialBodyParent
 *      | RegionParent
 *      | AreaParent
 * } ParentRef
 */

export { };
