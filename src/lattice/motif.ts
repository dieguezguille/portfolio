import { PerspectiveCamera, Vector3 } from "three";

import bayer from "./bayer";
import lattice from "./lattice";

export default function motif(columns: number, rows: number) {
  const geometry = lattice(8453);
  const camera = new PerspectiveCamera(32, columns / rows, 0.1, 100);
  camera.position.set(1.5, 2, 6.5);
  camera.up.set(1, 0, 0);
  camera.lookAt(1.5, 0, 0);
  camera.updateMatrixWorld();

  const point = new Vector3();
  const project = (index: number) => {
    point.fromArray(geometry.positions, index * 3).project(camera);
    return [((point.x + 1) / 2) * columns, ((1 - point.y) / 2) * rows] as const;
  };
  const intensities = new Float32Array(columns * rows);
  const accents = new Set<number>();
  const plot = (x: number, y: number, value: number) => {
    const cell = Math.floor(y) * columns + Math.floor(x);
    if (x >= 0 && x < columns && y >= 0 && y < rows) intensities[cell] = Math.min(1, (intensities[cell] ?? 0) + value);
    return cell;
  };

  for (let edge = 0; edge < geometry.edges.length / 2; edge++) {
    const [ax, ay] = project(geometry.edges[edge * 2] ?? 0);
    const [bx, by] = project(geometry.edges[edge * 2 + 1] ?? 0);
    const steps = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
    for (let step = 0; step <= steps; step++)
      plot(ax + ((bx - ax) * step) / steps, ay + ((by - ay) * step) / steps, 0.3);
  }
  for (let node = 0; node < geometry.positions.length / 3; node++) {
    const [x, y] = project(node);
    plot(x, y, 1);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const)
      plot(x + dx, y + dy, 0.3);
  }
  for (let edge = 4; edge < geometry.edges.length / 2; edge += 9) {
    const [ax, ay] = project(geometry.edges[edge * 2] ?? 0);
    const [bx, by] = project(geometry.edges[edge * 2 + 1] ?? 0);
    accents.add(plot((ax + bx) / 2, (ay + by) / 2, 0));
  }

  let foreground = "";
  let accent = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const cell = y * columns + x;
      if (accents.has(cell)) accent += `M${x} ${y}h1v1h-1z`;
      else if ((intensities[cell] ?? 0) > bayer(x, y)) foreground += `M${x} ${y}h1v1h-1z`;
    }
  }
  return { accent, foreground };
}
