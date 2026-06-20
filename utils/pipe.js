// utils/pipe.js
// @ts-check

/**
 * @example
 * const x = pipe(
 *      some(3),
 *      map_opt_(n => n * 2),
 *      unwrap_or_(0),
 * );
 *
 * @template T
 * @param {T} value
 * @param {...((x: any) => any)} fns
 * @returns {any}
 */
export const pipe = (value, ...fns) => fns.reduce((acc, fn) => fn(acc), value);

/**
 * @example
 * const process = flow(
 *      map_opt_(n => n * 2),
 *      unwrap_or_(0),
 * );
 * process(some(5));
 *
 * @param {...((x: any ) => any)} fns
 * @returns {(value: any) => any}
 */
export const flow = (...fns) => (value) => fns.reduce((acc, fn) => fn(acc), value);
