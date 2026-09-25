import copy from "../agents/copy";
import terminal, { type Session } from "./terminal";

const wired = new WeakSet<HTMLDialogElement>();

export default function palette(dialog: HTMLDialogElement) {
  const input = dialog.querySelector("input");
  const status = dialog.querySelector("[role=status]");
  const listbox = dialog.querySelector<HTMLElement>("[role=listbox]");
  const output = dialog.querySelector<HTMLElement>("[role=log]");
  if (!input || !status || !listbox || !output) return;
  const session = JSON.parse(dialog.querySelector("[data-terminal]")?.textContent ?? "{}") as Session;
  const history: string[] = [];
  let back = 0;
  const options = [...dialog.querySelectorAll<HTMLElement>("[role=option]")];
  const hint = status.textContent;
  const visible = () => options.filter((option) => !option.hidden);
  const select = (option?: HTMLElement) => {
    for (const item of options) item.setAttribute("aria-selected", String(item === option));
    if (option) {
      input.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  };
  const filter = () => {
    const isTerminal = input.value.startsWith(">");
    listbox.hidden = isTerminal;
    output.hidden = !isTerminal;
    input.setAttribute("aria-expanded", String(!isTerminal));
    if (isTerminal) {
      select();
      status.textContent = session.messages.hint;
      return;
    }
    const query = input.value.trim().toLowerCase();
    const hasScene = document.querySelector("[data-lattice][data-ready]") !== null;
    for (const option of options) {
      const requiresScene = option.dataset.action?.startsWith("lattice:") ?? false;
      option.hidden = !option.textContent.toLowerCase().includes(query) || (requiresScene && !hasScene);
    }
    for (const group of dialog.querySelectorAll<HTMLElement>("[role=group]")) {
      group.hidden = [...group.querySelectorAll<HTMLElement>("[role=option]")].every((option) => option.hidden);
    }
    const results = visible();
    select(results[0]);
    status.textContent = query
      ? (dialog.dataset.results ?? "").replace("{{count}}", () => String(results.length))
      : hint;
  };
  const run = async (option: HTMLElement) => {
    const { href, action } = option.dataset;
    if (action === "copy") {
      await navigator.clipboard.writeText(dialog.dataset.email ?? "");
      status.textContent = dialog.dataset.copied ?? "";
      return;
    }
    if (action === "markdown") {
      await copy(dialog.dataset.markdown ?? "");
      status.textContent = dialog.dataset.exported ?? "";
      return;
    }
    if (action === "terminal") {
      input.value = "> ";
      filter();
      return;
    }
    dialog.close();
    if (href) location.assign(href);
    else if (action === "grid") document.documentElement.toggleAttribute("data-grid");
    else if (action) document.dispatchEvent(new Event(action));
  };

  const submit = async () => {
    const line = input.value.slice(1).trim();
    input.value = "> ";
    if (line) history.push(line);
    back = history.length;
    const result = await terminal(line, session, async (url) => {
      const response = await fetch(url);
      return response.text();
    });
    if ("clear" in result) {
      output.replaceChildren();
    } else if ("exit" in result) {
      dialog.close();
    } else if ("href" in result) {
      dialog.close();
      location.assign(result.href);
    } else {
      const prompt = document.createElement("span");
      prompt.className = "prompt";
      prompt.textContent = `> ${line}\n`;
      output.append(prompt, `${result.lines.join("\n").trimEnd()}\n\n`);
      output.scrollTop = output.scrollHeight;
    }
  };

  if (!wired.has(dialog)) {
    wired.add(dialog);
    let wasOutside = false;
    dialog.addEventListener("pointerdown", (event) => {
      wasOutside = event.target === dialog;
    });
    dialog.addEventListener("click", (event) => {
      if (wasOutside && event.target === dialog) dialog.close();
    });
    input.addEventListener("input", filter);
    input.addEventListener("keydown", (event) => {
      if (input.value.startsWith(">")) {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          back = Math.min(history.length, Math.max(0, back + (event.key === "ArrowUp" ? -1 : 1)));
          input.value = `> ${history[back] ?? ""}`;
        } else if (event.key === "Enter") {
          event.preventDefault();
          void submit();
        }
        return;
      }
      const results = visible();
      const current = results.findIndex((option) => option.getAttribute("aria-selected") === "true");
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        select(results[(current + step + results.length) % results.length]);
        return;
      }
      const option = results[current];
      if (!option || event.key !== "Enter") return;
      event.preventDefault();
      void run(option);
    });
    for (const option of options) {
      option.addEventListener("click", () => void run(option));
      option.addEventListener("pointermove", () => {
        if (option.getAttribute("aria-selected") !== "true") select(option);
      });
    }
  }

  const previous = document.activeElement;
  dialog.addEventListener(
    "close",
    () => {
      if (previous instanceof HTMLElement) previous.focus();
    },
    { once: true },
  );
  input.value = "";
  filter();
  dialog.showModal();
  input.focus();
}
