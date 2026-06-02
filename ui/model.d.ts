// model.d.ts

import './types';

export type Model = {
    count: number,
    logs: string[],
    tick_interval_id: number | null,
    world: World,
};
