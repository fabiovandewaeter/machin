// engine/core/world/world.types.js

/**
 * @import {Clock} from "../clock.js"
 * @import {TimelineScheduler} from "../timeline/scheduler.js"
 * @import {Galaxy} from "../../map/galaxy.js"
 * @import {EntityRepo} from "../../entity/entity.types.js"
 * @import {InventoryRepo} from "../../inventory/inventory.types.js"
 * @import {RandomGenerator} from "../../../utils/random_generator.js"
 * @import {MachineRepo} from "../../machine/machine.types.js"
 * @import {FlowConnectionRepo} from "../../machine/flow_connection.js"
 */

/**
 * @typedef {Object} World
 * @prop {Clock} clock
 * @prop {RandomGenerator} random_generator
 * @prop {TimelineScheduler} timeline_scheduler 
 * @prop {Galaxy} galaxy
 * @prop {EntityRepo} entity_repo
 * @prop {InventoryRepo} inventory_repo
 * @prop {MachineRepo} machine_repo
 * @prop {FlowConnectionRepo} flow_connection_repo
 */
