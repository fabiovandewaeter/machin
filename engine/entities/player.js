// engine/entities/player.js
// @ts-check

import '../../utils/types.js'
import * as Opt from '../../utils/option.js'
import * as Repo from '../../utils/repository.js'

/** @type {EntityID} */
export const ID = /**@type {EntityID}*/(0);

/** 
 * @typedef {Entity & {
 * }} Player
 */

/**
 * @param {Readonly<EntityRepository>} repo
 * @returns {Player}
 */
export function get(repo) { return /**@type {Player} */(Opt.expect(Repo.get(repo, ID), "ERROR: couldn't find player in entity repo")); }
