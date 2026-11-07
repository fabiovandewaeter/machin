// utils/array.js

/**
 * @template T
 * @param {readonly T[]} array
 * @param {number} index
 * @returns {T}
 */
export function array_get(array, index) {
  const value = array[index];

  if (value === undefined) {
    throw new RangeError(`Invalid array index: ${index}`);
  }

  return value;
}

