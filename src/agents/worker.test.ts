import { describe, expect, test } from "vitest";

import worker from "./worker";

const files: Record<string, [string, string]> = {
  "/": ["<!doctype html>", "text/html"],
  "/index.md": ["# Home", "text/markdown"],
  "/work/exa": ["<!doctype html>", "text/html"],
  "/work/exa.md": ["# Exa App", "text/markdown"],
  "/favicon.svg": ["<svg/>", "image/svg+xml"],
};
const bindings = {
  ASSETS: {
    fetch: (input: Request | URL) => {
      const file = files[new URL(input instanceof Request ? input.url : input).pathname];
      return Promise.resolve(
        file
          ? new Response(file[0], { headers: { "Content-Type": file[1] } })
          : new Response("<!doctype html>", { status: 404, headers: { "Content-Type": "text/html" } }),
      );
    },
  },
};
const request = (path: string, accept = "text/html,application/xhtml+xml,*/*;q=0.8") =>
  worker.fetch(new Request(`https://guillermodieguez.com${path}`, { headers: { Accept: accept } }), bindings);

describe("worker", () => {
  test("serves html to browsers and varies on accept", async () => {
    const response = await request("/work/exa");
    expect(await response.text()).toBe("<!doctype html>");
    expect(response.headers.get("Vary")).toBe("Accept");
  });

  test("serves markdown when the client prefers it", async () => {
    for (const accept of ["text/markdown", "text/markdown, text/html;q=0.9", "text/html;q=0.5, text/markdown"]) {
      const response = await request("/work/exa", accept);
      expect(await response.text()).toBe("# Exa App");
      expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    }
    const home = await request("/", "text/markdown");
    expect(await home.text()).toBe("# Home");
  });

  test("keeps html when the client ranks it higher", async () => {
    const response = await request("/work/exa", "text/html, text/markdown;q=0.5");
    expect(await response.text()).toBe("<!doctype html>");
  });

  test("falls back to the page when there is no markdown", async () => {
    const response = await request("/nope", "text/markdown");
    expect(response.status).toBe(404);
  });

  test("labels markdown files and keeps them out of search results", async () => {
    const response = await request("/work/exa.md");
    expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
  });

  test("passes other assets through untouched", async () => {
    const response = await request("/favicon.svg", "text/markdown");
    expect(response.headers.get("Content-Type")).toBe("image/svg+xml");
    expect(response.headers.get("Vary")).toBeNull();
  });
});
