import copy from "../agents/copy";

const wired = new WeakSet<HTMLDialogElement>();

export default function palette(dialog: HTMLDialogElement) {
  const input = dialog.querySelector("input");
  const status = dialog.querySelector("[role=status]");
  if (!input || !status) return;
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
    dialog.close();
    if (href) location.assign(href);
    else if (action === "grid") document.documentElement.toggleAttribute("data-grid");
    else if (action) document.dispatchEvent(new Event(action));
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
