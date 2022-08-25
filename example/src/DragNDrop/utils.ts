import { reduce, concat, map, slice } from "lodash";

export const permutations = <T>(arr: T[]): T[][] => {
    if (arr.length <= 2)
      return arr.length === 2 ? [arr, [arr[1], arr[0]]] : [arr];
    return reduce(
      arr,
      (acc, val, i) =>
        concat(
          acc,
          map(
            permutations([...slice(arr, 0, i), ...slice(arr, i + 1, arr.length)]),
            vals => [val, ...vals]
          )
        ),
      [] as T[][]
    );
  };