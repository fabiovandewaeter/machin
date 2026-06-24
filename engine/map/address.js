// engine/map/address.js
// @ts-check

import * as Coord from './coord.js'
import * as Repo from '../../utils/repository.js'
import * as Opt from '../../utils/option.js'

/**
 * @typedef {Object} Address
 * @property {ContinentID} continent
 * @property {RegionID} region
 * @property {AreaID} area
 * @property {RoomCoord} coord
 */

/**
 * @param {D<Address>} address
 * @returns {string}
 */
export function to_string(address) { return `{continent: ${address.continent}, region: ${address.region}, area: ${address.area}, coord: ${Coord.to_string3D(address.coord)}}`; }

/**
 * vérifie si la room est bien dans la map en s'assurant que les id sont dans les repo
 * et dans la map
 * @param {D<Map3D>} map
 * @param {D<Address>} address 
 * @returns {boolean}
 */
export function is_valid_address(map, address) {
    if (!(map.continents.includes(address.continent))) return false;
    const continent = Opt.unwrap(Repo.get(map.continent_repo, address.continent));
    if (!(continent.regions.includes(address.region))) return false;
    const region = Opt.unwrap(Repo.get(map.region_repo, address.region));
    if (!(region.areas.includes(address.area))) return false;
    const area = Opt.unwrap(Repo.get(map.area_repo, address.area));
    if (!(Object.keys(area.rooms).includes(Coord.key_from_3D(address.coord)))) return false;

    return true;
}

/**
 * vérifie si la room est bien dans la map en s'assurant que les id sont dans les repo
 * et dans la map
 * @param {D<Map3D>} map
 * @param {Omit<D<Address>, "coord">} address 
 * @returns {boolean}
 */
export function is_valid_address_before_room(map, address) {
    if (!(map.continents.includes(address.continent))) return false;
    const continent = Opt.unwrap(Repo.get(map.continent_repo, address.continent));
    if (!(continent.regions.includes(address.region))) return false;
    const region = Opt.unwrap(Repo.get(map.region_repo, address.region));
    if (!(region.areas.includes(address.area))) return false;
    const area = Opt.unwrap(Repo.get(map.area_repo, address.area));

    return true;
}
