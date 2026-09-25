import tokens from "./tokens.css?raw";

const [dark = "", light = ""] = tokens.split("@media (prefers-color-scheme: light)", 2);

export default {
  accent: color(dark, "accent"),
  bg: color(dark, "bg"),
  fg: color(dark, "fg"),
  muted: color(dark, "muted"),
  light: { bg: color(light, "bg") },
};

function color(source: string, name: string) {
  const value = new RegExp(String.raw`--${name}: (#\w+);`).exec(source)?.[1];
  if (!value) throw new Error(`missing color token --${name}`);
  return value;
}
