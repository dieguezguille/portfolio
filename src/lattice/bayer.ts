export default function bayer(x: number, y: number) {
  let value = 0;
  for (let bit = 0; bit < 3; bit++) {
    const u = (x >> bit) & 1;
    const v = (y >> bit) & 1;
    value = value * 4 + 2 * (u ^ v) + v;
  }
  return (value + 0.5) / 64;
}
