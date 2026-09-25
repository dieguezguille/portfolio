export default async function copy(url: string) {
  await navigator.clipboard.write([new ClipboardItem({ "text/plain": text(url) })]);
}

async function text(url: string) {
  const response = await fetch(url);
  return new Blob([await response.text()], { type: "text/plain" });
}
