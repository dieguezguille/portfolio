export default function progress(
  scroll: number,
  center: number,
  viewport: number,
  target: { fade: number; flatten: number; orbit: number },
) {
  const t = Math.min(1, Math.max(0, (scroll + viewport * 0.4 - center) / (viewport * 0.5)));
  target.orbit = t;
  target.flatten = smoothstep(0.05, 0.55, t);
  target.fade = 1 - smoothstep(0.6, 0.95, t);
  return target;
}

function smoothstep(from: number, to: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return x * x * (3 - 2 * x);
}
