import { describe, expect, test } from "vitest";

import Governor from "./Governor";

const run = (governor: Governor, delta: number, frames: number) => {
  for (let frame = 0; frame < frames; frame++) governor.sample(delta);
};

describe("governor", () => {
  test("starts at the highest tier", () => {
    expect(new Governor().current.name).toBe("high");
  });

  test("steps down one tier per slow window", () => {
    const governor = new Governor();
    run(governor, 30, 60);
    expect(governor.current.name).toBe("medium");
    run(governor, 30, 60);
    expect(governor.current.name).toBe("low");
    run(governor, 30, 600);
    expect(governor.current.name).toBe("low");
  });

  test("holds a smooth frame rate without changing tier", () => {
    const governor = new Governor();
    run(governor, 16.7, 6000);
    expect(governor.current.name).toBe("high");
  });

  test("ignores outliers from paused or hidden tabs", () => {
    const governor = new Governor();
    run(governor, 1000, 600);
    expect(governor.current.name).toBe("high");
  });

  test("retries a tier after sustained calm, then gives up on it", () => {
    const governor = new Governor();
    run(governor, 30, 60);
    expect(governor.current.name).toBe("medium");
    run(governor, 16.7, 60 * 5);
    expect(governor.current.name).toBe("high");
    run(governor, 30, 60);
    expect(governor.current.name).toBe("medium");
    run(governor, 16.7, 60 * 50);
    expect(governor.current.name).toBe("medium");
  });

  test("needs the whole calm streak before stepping up", () => {
    const governor = new Governor();
    run(governor, 30, 60);
    run(governor, 16.7, 60 * 4);
    run(governor, 20, 60);
    run(governor, 16.7, 60 * 4);
    expect(governor.current.name).toBe("medium");
  });
});
