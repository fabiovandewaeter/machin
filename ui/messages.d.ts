// ui/messages.d.ts

export type TickMsg = { type: 'tick' }
export type StartStopTickIntervalMsg = { type: 'start_stop_tick_interval' }

export type SkipSecondsMsg = { type: 'skip_seconds', amount: number }

export type Msg = TickMsg | StartStopTickIntervalMsg | SkipSecondsMsg
