import { describe, expect, test } from "vitest";

import terminal, { type Session } from "./terminal";

const session: Session = {
  help: [
    ["help", "List the commands"],
    ["ls", "List the pages"],
  ],
  log: ["* 2026-06  Head of frontend, Exa Labs"],
  messages: {
    command: "Command not found: {{command}}. Type help.",
    hint: "Type help and press Enter",
    page: "No such page: {{page}}. Type ls.",
    sudo: "Nice try.",
  },
  pages: [
    { name: "cv", href: "/cv", markdown: "/cv.md" },
    { name: "work/exa", href: "/work/exa", markdown: "/work/exa.md" },
  ],
  whoami: ["Guillermo Diéguez"],
};
const read = (url: string) => Promise.resolve(`# ${url}`);
const run = (line: string) => terminal(line, session, read);

describe("terminal", () => {
  test("lists commands and pages", async () => {
    expect(await run("help")).toEqual({ lines: ["help         List the commands", "ls           List the pages"] });
    expect(await run("ls")).toEqual({ lines: ["cv  work/exa"] });
  });

  test("prints a page as markdown, with or without the extension", async () => {
    expect(await run("cat work/exa")).toEqual({ lines: ["# /work/exa.md"] });
    expect(await run("  cat   cv.md ")).toEqual({ lines: ["# /cv.md"] });
  });

  test("opens pages and rejects unknown ones", async () => {
    expect(await run("open cv")).toEqual({ href: "/cv" });
    expect(await run("open nope")).toEqual({ lines: ["No such page: nope. Type ls."] });
  });

  test("answers the rest of the commands", async () => {
    expect(await run("whoami")).toEqual({ lines: ["Guillermo Diéguez"] });
    expect(await run("git log")).toEqual({ lines: ["* 2026-06  Head of frontend, Exa Labs"] });
    expect(await run("sudo make me a sandwich")).toEqual({ lines: ["Nice try."] });
    expect(await run("clear")).toEqual({ clear: true });
    expect(await run("exit")).toEqual({ exit: true });
    expect(await run("")).toEqual({ lines: [] });
  });

  test("reports unknown commands", async () => {
    expect(await run("rm -rf /")).toEqual({ lines: ["Command not found: rm. Type help."] });
    expect(await run("git push")).toEqual({ lines: ["Command not found: git push. Type help."] });
  });
});
