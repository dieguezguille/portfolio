import markdown from "./markdown";

export default {
  async fetch(request: Request, bindings: { ASSETS: { fetch: (input: Request | URL) => Promise<Response> } }) {
    const url = new URL(request.url);
    if (url.pathname.endsWith(".md")) return document(await bindings.ASSETS.fetch(request));
    if (prefers(request.headers.get("Accept") ?? "")) {
      const response = await bindings.ASSETS.fetch(new URL(markdown(url.pathname), url));
      if (response.ok) return document(response);
    }
    const card = cards.get(url.pathname);
    if (card && /^(?:curl|wget|httpie|xh)\//i.test(request.headers.get("User-Agent") ?? "")) {
      const response = await bindings.ASSETS.fetch(new URL(card, url));
      if (response.ok) return document(response, "text/plain", "Accept, User-Agent");
    }
    const response = await bindings.ASSETS.fetch(request);
    if (!response.headers.get("Content-Type")?.startsWith("text/html")) return response;
    const page = new Response(response.body, response);
    page.headers.append("Vary", card ? "Accept, User-Agent" : "Accept");
    return page;
  },
};

function document(source: Response, type = "text/markdown", vary = "Accept") {
  const response = new Response(source.body, source);
  if (!response.ok) return response;
  response.headers.set("Content-Type", `${type}; charset=utf-8`);
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.append("Vary", vary);
  return response;
}

function prefers(accept: string) {
  const weights = new Map(
    accept
      .toLowerCase()
      .split(",")
      .map((part) => {
        const [type = "", ...parameters] = part.split(";").map((value) => value.trim());
        const quality = parameters.find((parameter) => parameter.startsWith("q="));
        return [type, quality ? Number(quality.slice(2)) : 1];
      }),
  );
  const weight = weights.get("text/markdown") ?? 0;
  return weight > 0 && weight >= (weights.get("text/html") ?? 0);
}

const cards = new Map([
  ["/", "/card.txt"],
  ["/es", "/es/card.txt"],
]);
