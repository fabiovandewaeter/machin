// engine/map/movement.js
// @ts-check

import * as Address from './address.js'
import * as Res from '../../utils/result.js'

/**
 * @param {D<World>} world
 * @param {D<Entity>} entity 
 * @param {D<Address>} from
 * @param {D<Address>} to
 * @return {Res<void, string>}
 */
export function can_move(world, entity, from, to) {
    if (!Address.is_valid_address(world.map, to)) return Res.err('Address not valid');

    return Res.ok(undefined);
}
