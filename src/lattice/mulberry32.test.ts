import { describe, expect, test } from "vitest";

import mulberry32 from "./mulberry32";

describe("mulberry32", () => {
  test("repeats the same sequence for the same seed", () => {
    const a = mulberry32(8453);
    const b = mulberry32(8453);
    expect(Array.from({ length: 100 }, () => a())).toStrictEqual(Array.from({ length: 100 }, () => b()));
  });

  test("diverges for different seeds", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });

  test("stays within [0, 1) with a roughly uniform mean", () => {
    const random = mulberry32(42);
    const values = Array.from({ length: 10_000 }, () => random());
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
    expect(values.reduce((total, value) => total + value, 0) / values.length).toBeCloseTo(0.5, 1);
  });
});
