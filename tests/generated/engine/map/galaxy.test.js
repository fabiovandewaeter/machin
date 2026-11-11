// tests/generated/engine/map/galaxy.test.js

import { enginesignal_on } from "../../../../src/engine/core/signal/signal.js";
import { galaxy_create, galaxy_init } from "../../../../src/engine/map/galaxy.js";
import { randomgenerator_create } from "../../../../src/utils/random_generator.js";
import { assert_equal } from "../../../shared/assert.js";
import { test } from "../../../shared/test.js";

test("initialiser la galaxie termine les sorties réciproques avant notification", () => {
    const galaxy = galaxy_create();
    let calls = 0;
    enginesignal_on("room.exits.set", () => {
        assert_equal(galaxy.room_repo.elements.length, 2);
        for (const room of galaxy.room_repo.elements) assert_equal(Object.keys(room.exits).length, 1);
        calls++;
    });
    galaxy_init(galaxy, randomgenerator_create(1));
    assert_equal(calls, 2);
});
