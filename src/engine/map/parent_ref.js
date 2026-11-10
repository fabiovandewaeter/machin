// engine/map/parent_ref.js

/**
 * @typedef {Object} StarSystemParent
 * @prop {'SYSTEM'} kind
 * @prop {import("../core/ids.types.js").StarSystemID} id
 * 
 * @typedef {Object} CelestialBodyParent
 * @prop {'CELESTIAL_BODY'} kind
 * @prop {import("../core/ids.types.js").CelestialBodyID} id
 * 
 * @typedef {Object} RegionParent
 * @prop {'REGION'} kind
 * @prop {import("../core/ids.types.js").RegionID} id
 * 
 * @typedef {Object} AreaParent
 * @prop {'AREA'} kind
 * @prop {import("../core/ids.types.js").AreaID} id
 * 
 * @typedef {
 *      | StarSystemParent
 *      | CelestialBodyParent
 *      | RegionParent
 *      | AreaParent
 * } ParentRef
 */

export { };
