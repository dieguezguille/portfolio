import mulberry32 from "./mulberry32";

export default function lattice(seed: number) {
  const random = mulberry32(seed);
  const commits: number[] = [];
  const edges: number[] = [];
  const heads = lanes.map(() => -1);
  const lengths = lanes.map(() => 0);
  const commit = (lane: number, ...parents: number[]) => {
    for (const parent of parents) edges.push(parent, commits.length);
    heads[lane] = commits.length;
    lengths[lane] = (lengths[lane] ?? 0) + 1;
    commits.push(lane);
  };

  commit(0);
  for (let slot = 1; slot < slots; slot++) {
    const main = heads[0] ?? 0;
    const open = heads.flatMap((head, lane) => (lane > 0 && head >= 0 ? [lane] : []));
    const free = heads.findIndex((head, lane) => lane > 0 && head < 0);
    const branch = open[Math.floor(random() * open.length)];
    const roll = random();
    if (free > 0 && roll < 0.08 + (0.3 * slot) / slots) {
      lengths[free] = 0;
      commit(free, main);
    } else if (branch !== undefined && (lengths[branch] ?? 0) > 2 && roll < 0.5) {
      commit(0, main, heads[branch] ?? 0);
      heads[branch] = -1;
    } else if (branch !== undefined && roll < 0.85) commit(branch, heads[branch] ?? 0);
    else commit(0, main);
  }

  return {
    positions: new Float32Array(
      commits.flatMap((lane, slot) => [(slot - (slots - 1) / 2) * spacing, lanes[lane]?.y ?? 0, lanes[lane]?.z ?? 0]),
    ),
    layers: new Float32Array(commits.map((_, slot) => slot / (slots - 1))),
    targets: new Float32Array(commits.flatMap((_, slot) => [slot / (slots - 1) - 0.5, 0, 0])),
    edges: new Uint16Array(edges),
  };
}

const slots = 44;
const spacing = 0.32;
const lanes = [
  { y: 0, z: 0 },
  { y: 0.55, z: -0.45 },
  { y: -0.55, z: 0.4 },
  { y: 1.1, z: 0.3 },
  { y: -1.1, z: -0.55 },
];
