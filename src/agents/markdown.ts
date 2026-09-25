export default function markdown(path: string) {
  return `${path.replace(/\/$/, "/index")}.md`;
}
