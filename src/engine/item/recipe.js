// engine/item/recipe.js

/**
 * @import {ResourceID} from "./resource.js"
 */

// TODO:
// une combinaison est possible car il y a un craft qui existe(par exemple on peut faire une pioche en fer car il y a un craft de pioche en fer mais meme si le typage autorise une pioche en sable peut - être qu'il y a aucun craft pour ça donc c'est pas faisable)

// machines qui créent certaines conditions et sont modulables ? par exemple un four mk3 cest une machine faite pour produire X kelvin et X de pression en fonction de ses modules / composants ou ses matériaux / qualité et pas juste un machine que j'ai écrite comme ça durant le dev
//     -> pareil pour les minerais je peux avoir un gisement de fer ou de débris ça dépend juste des gisements que je pose dans le jeu pas du typage

/**
 * @typedef {Object} ResourceAmount
 * @prop {ResourceID} resource
 * @prop {number} amount
 *
 * @typedef {Object} Recipe
 * @prop {ResourceAmount[]} node_inputs
 * @prop {ResourceAmount[]} inputs
 * @prop {ResourceAmount[]} outputs
 */

export const RECIPE = Object.freeze(/** @satisfies {Record<string, Recipe>} */ ({
    STONE_EXTRACTION: {
        node_inputs: [{ resource: "STONE_ORE", amount: 1000 }],
        inputs: [],
        outputs: [{ resource: "STONE_ORE", amount: 1000 }],
    },
    COPPER_EXTRACTION: {
        node_inputs: [{ resource: "COPPER_ORE", amount: 1000 }],
        inputs: [],
        outputs: [{ resource: "COPPER_ORE", amount: 1000 }],
    },
    IRON_EXTRACTION: {
        node_inputs: [{ resource: "IRON_ORE", amount: 1000 }],
        inputs: [{ resource: "WATER", amount: 500 }],
        outputs: [{ resource: "IRON_ORE", amount: 1000 }],
    },
    WATER_PUMPING: {
        node_inputs: [{ resource: "WATER", amount: 2000 }],
        inputs: [],
        outputs: [{ resource: "WATER", amount: 2000 }],
    },
    COPPER_SMELTING: {
        node_inputs: [],
        inputs: [{ resource: "COPPER_ORE", amount: 600 }],
        outputs: [{ resource: "COPPER_INGOT", amount: 300 }],
    },
    IRON_SMELTING: {
        node_inputs: [],
        inputs: [{ resource: "IRON_ORE", amount: 600 }],
        outputs: [{ resource: "IRON_INGOT", amount: 300 }],
    },
    BRONZE_SMELTING: {
        node_inputs: [],
        inputs: [{ resource: "COPPER_INGOT", amount: 900 }, { resource: "STONE_ORE", amount: 300 }],
        outputs: [{ resource: "BRONZE_INGOT", amount: 1200 }],
    },
}));
/** @typedef {keyof typeof RECIPE} RecipeID */
