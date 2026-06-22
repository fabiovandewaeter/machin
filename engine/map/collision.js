// engine/map/collision.js
// @ts-check

import * as Continent from './continent.js'
import * as Region from './region.js'
import * as Area from './area.js'
import * as Room from './room.js'
import * as Coord from './coord.js'
import * as Opt from '../../utils/option.js'
import * as Repo from '../../utils/repository.js'

/**
 * @param {DeepReadonly<World>} world
 * @param {DeepReadonly<Entity>} entity 
 * @param {Address} from
 * @param {Address} to
 * @return {boolean}
 */
export function can_move(world, entity, from, to) {
    const map = world.map;
    if (!(to.continent in map.continents)) throw new Error(`continent id ${to.continent} not in current map`);
    const continent = Opt.unwrap(Repo.get(map.continent_repo, to.continent));
    if (!(to.region in continent.regions)) throw new Error(`region id ${to.region} not in continent ${to.continent}`);
    const region = Opt.unwrap(Repo.get(continent.region_repo, to.region));
    if (!(to.area in region.areas)) throw new Error(`area id ${to.area} not in region ${to.region}`);
    const area = Opt.unwrap(Repo.get(region.area_repo, to.area));
    if (!(Coord.key_from_3D(to.coord) in Object.keys(area.rooms))) throw new Error(`room ${Coord.to_string3D(to.coord)} not in area ${to.area}`);

    return true;
}
