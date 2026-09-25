import { expect, test } from "vitest";

import bayer from "./bayer";

test("bayer 8×8 uses every threshold exactly once", () => {
  const values = Array.from({ length: 64 }, (_, index) => bayer(index % 8, Math.floor(index / 8)) * 64 - 0.5);
  expect(values.toSorted((a, b) => a - b)).toStrictEqual(Array.from({ length: 64 }, (_, index) => index));
});

test("bayer matches the recursive matrix corners", () => {
  expect(bayer(0, 0) * 64 - 0.5).toBe(0);
  expect(bayer(1, 1) * 64 - 0.5).toBe(16);
  expect(bayer(1, 0) * 64 - 0.5).toBe(32);
  expect(bayer(0, 1) * 64 - 0.5).toBe(48);
});
