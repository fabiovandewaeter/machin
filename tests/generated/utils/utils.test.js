// tests/generated/utils/utils.test.js

import { utils_data_key } from "../../../src/utils/utils.js";
import { assert, assert_equal } from "../../shared/assert.js";
import { test } from "../../shared/test.js";

test("la clé de données ignore l'ordre des clés à tous les niveaux", () => {
    assert_equal(utils_data_key({ b: 1, a: { d: [1, { f: 2, e: 3 }], c: 4 } }), utils_data_key({ a: { c: 4, d: [1, { e: 3, f: 2 }] }, b: 1 }));
});

test("la clé de données conserve les objets imbriqués", () => {
    assert(utils_data_key({ a: { b: 1 } }) !== utils_data_key({ a: { b: 2 } }));
    assert_equal(utils_data_key({ a: { b: 1 } }), '{"a":{"b":1}}');
});
