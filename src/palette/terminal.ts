export default async function terminal(line: string, session: Session, read: (url: string) => Promise<string>) {
  const [command = "", ...rest] = line.trim().split(/\s+/);
  const argument = rest.join(" ");
  const page = session.pages.find((item) => item.name === argument.replace(/\.md$/, ""));
  const missing = { lines: [session.messages.page.replace("{{page}}", () => argument)] };
  switch (command) {
    case "":
      return { lines: [] };
    case "cat":
      return page ? { lines: [await read(page.markdown)] } : missing;
    case "clear":
      return { clear: true };
    case "exit":
      return { exit: true };
    case "git":
      return argument === "log" ? { lines: session.log } : unknown(session, line.trim());
    case "help":
      return { lines: session.help.map(([name = "", description = ""]) => `${name.padEnd(13)}${description}`) };
    case "ls":
      return { lines: [session.pages.map((item) => item.name).join("  ")] };
    case "open":
      return page ? { href: page.href } : missing;
    case "sudo":
      return { lines: [session.messages.sudo] };
    case "whoami":
      return { lines: session.whoami };
    default:
      return unknown(session, command);
  }
}

function unknown(session: Session, command: string) {
  return { lines: [session.messages.command.replace("{{command}}", () => command)] };
}

export type Session = {
  help: string[][];
  log: string[];
  messages: { command: string; hint: string; page: string; sudo: string };
  pages: { href: string; markdown: string; name: string }[];
  whoami: string[];
};
