import { describe, expect, test } from "vitest";

import lattice from "./lattice";

describe("lattice", () => {
  const geometry = lattice(8453);
  const count = geometry.positions.length / 3;
  const parents = (node: number) =>
    Array.from({ length: geometry.edges.length / 2 }, (_, edge) => edge).filter(
      (edge) => geometry.edges[edge * 2 + 1] === node,
    );

  test("is deterministic for a seed", () => {
    expect(lattice(8453)).toStrictEqual(geometry);
  });

  test("keeps one layer and one target per commit", () => {
    expect(geometry.layers).toHaveLength(count);
    expect(geometry.targets).toHaveLength(count * 3);
  });

  test("links every commit but the first to an earlier one", () => {
    expect(parents(0)).toHaveLength(0);
    for (let node = 1; node < count; node++) expect(parents(node).length).toBeGreaterThan(0);
    for (let edge = 0; edge < geometry.edges.length / 2; edge++) {
      expect(geometry.edges[edge * 2] ?? count).toBeLessThan(geometry.edges[edge * 2 + 1] ?? 0);
    }
  });

  test("merges only into main", () => {
    const merges = Array.from({ length: count }, (_, node) => node).filter((node) => parents(node).length > 1);
    expect(merges.length).toBeGreaterThan(0);
    for (const node of merges) expect(geometry.positions[node * 3 + 1]).toBe(0);
  });

  test("flattens into one line in commit order", () => {
    for (let node = 1; node < count; node++) {
      expect(geometry.targets[node * 3]).toBeGreaterThan(geometry.targets[(node - 1) * 3] ?? 0);
      expect(geometry.targets[node * 3 + 1]).toBe(0);
    }
  });
});
