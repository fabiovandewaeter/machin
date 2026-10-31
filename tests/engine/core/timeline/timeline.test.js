// tests/engine/core/timeline/timeline.test.js

import { clock_create } from "../../../../engine/core/clock.js";
import { timelinedispatcher_register } from "../../../../engine/core/timeline/dispatcher.js";
import { timelinescheduler_cancel, timelinescheduler_create, timelinescheduler_pop_due, timelinescheduler_schedule } from "../../../../engine/core/timeline/scheduler.js";
import { timeline_advance_by, timeline_advance_to, timeline_advance_to_now, timeline_clear_handlers } from "../../../../engine/core/timeline/timeline.js";
import { world_create } from "../../../../engine/core/world/world.js";
import { assert_equal, assert_throws } from "../../../../utils/assert.js";
import { test } from "../../../test.js";

test("les handlers voient l'heure de leur événement et peuvent en planifier la suite", () => {
    timeline_clear_handlers();
    const world = world_create();
    world.clock = clock_create(0);
    /** @type {number[]} */
    const observed = [];
    timelinedispatcher_register("craft_complete", current_world => {
        observed.push(current_world.clock.sim_time);
        timelinescheduler_schedule(current_world.timeline_scheduler, "potion_effect", current_world.clock.sim_time + 5, {});
    });
    timelinedispatcher_register("potion_effect", current_world => observed.push(current_world.clock.sim_time));
    timelinescheduler_schedule(world.timeline_scheduler, "craft_complete", 10, {});
    try {
        timeline_advance_to(world, 20);
        assert_equal(observed.join(","), "10,15");
        assert_equal(world.clock.sim_time, 20);
        assert_equal(world.timeline_scheduler.repo.elements.length, 0);
    } finally {
        timeline_clear_handlers();
    }
});

test("les annulations conservent l'ordre des événements à la même date", () => {
    const scheduler = timelinescheduler_create();
    const first = timelinescheduler_schedule(scheduler, "craft_complete", 5, {});
    const cancelled = timelinescheduler_schedule(scheduler, "craft_complete", 5, {});
    const last = timelinescheduler_schedule(scheduler, "craft_complete", 5, {});
    assert_equal(timelinescheduler_cancel(scheduler, cancelled.id), true);
    assert_equal(timelinescheduler_cancel(scheduler, cancelled.id), false);
    assert_equal(timelinescheduler_pop_due(scheduler, 4), null);
    assert_equal(timelinescheduler_pop_due(scheduler, 5)?.id, first.id);
    assert_equal(timelinescheduler_pop_due(scheduler, 5)?.id, last.id);
    assert_equal(timelinescheduler_pop_due(scheduler, 5), null);
});

test("les dates invalides et les retours dans le temps sont refusés sans mutation", () => {
    const world = world_create();
    world.clock = clock_create(10);
    for (const target of [9, NaN, Infinity]) assert_throws(() => timeline_advance_to(world, target));
    for (const delay of [-1, NaN, Infinity]) assert_throws(() => timeline_advance_by(world, delay));
    for (const at of [-1, NaN, Infinity]) {
        assert_throws(() => timelinescheduler_schedule(world.timeline_scheduler, "craft_complete", at, {}));
    }
    assert_equal(world.clock.sim_time, 10);
    assert_equal(world.timeline_scheduler.repo.elements.length, 0);
});

test("un chargement conserve le temps déjà simulé au-delà de l'heure réelle", () => {
    const world = world_create();
    const future = Date.now() + 100000;
    world.clock = clock_create(future);
    timeline_advance_to_now(world);
    assert_equal(world.clock.sim_time, future);
});

test("effacer les handlers retire réellement les anciennes inscriptions", () => {
    const world = world_create();
    world.clock = clock_create(0);
    let calls = 0;
    timelinedispatcher_register("craft_complete", () => calls++);
    timeline_clear_handlers();
    timelinescheduler_schedule(world.timeline_scheduler, "craft_complete", 1, {});
    assert_throws(() => timeline_advance_to(world, 1));
    assert_equal(calls, 0);
});
