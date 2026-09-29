import type contributions from "./contributions";

export default function years(entries: (typeof contributions)[number][]) {
  const all = entries.map((entry) => entry.year);
  return [...new Set([Math.min(...all), Math.max(...all)])].join("–");
}
