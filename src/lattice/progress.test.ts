import { describe, expect, test } from "vitest";

import progress from "./progress";

const at = (scroll: number) => progress(scroll, 500, 1000, { orbit: 0, flatten: 0, fade: 1 });

describe("progress", () => {
  test("rests before the lattice rises past the viewport", () => {
    expect(at(0)).toStrictEqual({ orbit: 0, flatten: 0, fade: 1 });
  });

  test("ends flat and faded after half a viewport more", () => {
    expect(at(600)).toStrictEqual({ orbit: 1, flatten: 1, fade: 0 });
  });

  test("flattens before it fades", () => {
    const middle = at(400);
    expect(middle.flatten).toBeGreaterThan(0.9);
    expect(middle.fade).toBeGreaterThan(0.5);
  });

  test("is monotonic", () => {
    let previous = at(0);
    for (let scroll = 0; scroll <= 800; scroll += 10) {
      const current = at(scroll);
      expect(current.flatten).toBeGreaterThanOrEqual(previous.flatten);
      expect(current.fade).toBeLessThanOrEqual(previous.fade);
      previous = current;
    }
  });
});
