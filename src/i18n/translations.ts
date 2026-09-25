import es from "./es.json";

export default function translations(locale?: string) {
  return (key: keyof typeof es) => (locale === "es" ? es[key] : key);
}
