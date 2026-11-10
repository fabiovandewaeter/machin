// tests/generated/utils/random_generator.test.js

import { randomgenerator_create, randomgenerator_next_float, randomgenerator_next_int } from "../../../src/utils/random_generator.js";
import { assert, assert_equal } from "../../shared/assert.js";
import { test } from "../../shared/test.js";

test("une même seed produit la même suite et une autre seed une suite différente", () => {
    const first = randomgenerator_create(42);
    const same_seed = randomgenerator_create(42);
    const other_seed = randomgenerator_create(43);
    let differences = 0;
    for (let index = 0; index < 100; index++) {
        const value = randomgenerator_next_float(first);
        assert_equal(value, randomgenerator_next_float(same_seed));
        if (value !== randomgenerator_next_float(other_seed)) differences++;
    }
    assert(differences > 0);
});

test("les tirages restent dans leurs bornes", () => {
    const generator = randomgenerator_create(7);
    for (let index = 0; index < 1000; index++) {
        const value = randomgenerator_next_float(generator);
        assert(value >= 0 && value < 1);
        const integer = randomgenerator_next_int(generator, 5);
        assert(Number.isInteger(integer) && integer >= 0 && integer < 5);
    }
});
