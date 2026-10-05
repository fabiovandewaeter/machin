// engine/map/parent_ref.js
// @ts-check

/**
 * @typedef {Object} StarSystemParent
 * @property {'SYSTEM'} kind
 * @property {import("./star_system.js").StarSystemID} id
 * 
 * @typedef {Object} CelestialBodyParent
 * @property {'CELESTIAL_BODY'} kind
 * @property {import("./celestial_body.js").CelestialBodyID} id
 * 
 * @typedef {Object} RegionParent
 * @property {'REGION'} kind
 * @property {import("./region.js").RegionID} id
 * 
 * @typedef {Object} AreaParent
 * @property {'AREA'} kind
 * @property {import("./area.js").AreaID} id
 * 
 * @typedef {
 *      | StarSystemParent
 *      | CelestialBodyParent
 *      | RegionParent
 *      | AreaParent
 * } ParentRef
 */

export { };
