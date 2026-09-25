// cspell:ignore webglcontextlost webglcontextrestored
import { Timer } from "three";

import Diagnostics from "./Diagnostics";
import Governor from "./Governor";
import progress from "./progress";
import Scene from "./Scene";

export default async function mount(container: HTMLElement) {
  let scene: Scene;
  try {
    scene = new Scene();
  } catch {
    return;
  }

  const control = container.querySelector("button");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const timer = new Timer();
  const governor = new Governor();
  const size = { width: 0, height: 0, top: 0, left: 0, center: 0, viewport: 0, dirty: true };
  const pointer = { x: 0, y: 0, strength: 0 };
  const target = { orbit: 0, flatten: 0, fade: 1 };
  const state = {
    elapsed: 0,
    orbit: 0,
    scroll: scrollY,
    visible: false,
    paused: localStorage.getItem("motion") === "paused",
    running: false,
    diagnostics: new URLSearchParams(location.search).has("debug") ? new Diagnostics() : undefined,
  };
  const colors = () => {
    const style = getComputedStyle(document.documentElement);
    scene.colors(style.getPropertyValue("--fg"), style.getPropertyValue("--accent"));
  };
  const measure = () => {
    const rect = container.getBoundingClientRect();
    Object.assign(size, {
      width: rect.width,
      height: rect.height,
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      center: rect.top + scrollY + rect.height / 2,
      viewport: document.documentElement.clientHeight,
      dirty: true,
    });
  };
  const apply = () => {
    if (!size.dirty || size.width === 0 || size.height === 0) return;
    const tier = governor.current;
    scene.resize(size.width, size.height, Math.min(devicePixelRatio, tier.dpr), tier.divisor);
    scene.density(tier.packets);
    size.dirty = false;
  };
  const frame = (timestamp?: number) => {
    timer.update(timestamp);
    const delta = timer.getDelta();
    state.elapsed += delta;
    if (governor.sample(delta * 1000)) size.dirty = true;
    apply();
    const ease = 1 - Math.exp(-delta * 4);
    progress(state.scroll, size.center, size.viewport, target);
    const { uniforms, screen } = scene;
    scene.hover(
      ((pointer.x + scrollX - size.left) / size.width) * 2 - 1,
      1 - ((pointer.y + state.scroll - size.top) / size.height) * 2,
      pointer.strength,
      ease,
    );
    uniforms.flatten.value += (target.flatten - uniforms.flatten.value) * ease;
    screen.fade.value += (target.fade - screen.fade.value) * ease;
    state.orbit += (target.orbit - state.orbit) * ease;
    scene.render(state.elapsed, state.orbit);
    state.diagnostics?.frame(delta, scene, governor);
  };
  const still = () => {
    apply();
    scene.hover(0, 0, 0, 1);
    scene.uniforms.flatten.value = 0;
    scene.screen.fade.value = 1;
    state.orbit = 0;
    scene.render(state.elapsed);
  };
  const update = () => {
    const shouldRun = state.visible && !document.hidden && !state.paused && !motion.matches;
    if (control) {
      control.hidden = motion.matches;
      control.textContent = (state.paused ? control.dataset.play : control.dataset.pause) ?? "";
    }
    if (shouldRun === state.running) return;
    state.running = shouldRun;
    if (shouldRun) {
      timer.reset();
      scene.renderer.setAnimationLoop(frame);
    } else {
      scene.renderer.setAnimationLoop(null);
      if (state.visible) still();
    }
  };
  const toggle = () => {
    state.paused = !state.paused;
    localStorage.setItem("motion", state.paused ? "paused" : "playing");
    update();
  };

  const resize = new ResizeObserver(() => {
    measure();
    if (!state.running) still();
  });
  const intersection = new IntersectionObserver(([entry]) => {
    state.visible = entry?.isIntersecting ?? false;
    update();
  });
  const controller = new AbortController();
  const options = { passive: true, signal: controller.signal };
  const track = (event: PointerEvent) => {
    if (motion.matches) return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.strength = 1;
  };
  const release = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") pointer.strength = 0;
  };
  const dispose = () => {
    controller.abort();
    resize.disconnect();
    intersection.disconnect();
    timer.dispose();
    state.diagnostics?.dispose();
    scene.renderer.setAnimationLoop(null);
    scene.dispose();
    scene.canvas.remove();
    delete container.dataset.ready;
  };

  addEventListener("pointermove", track, options);
  addEventListener("pointerdown", track, options);
  addEventListener("pointerup", release, options);
  addEventListener("pointercancel", release, options);
  addEventListener("scroll", () => (state.scroll = scrollY), options);
  document.documentElement.addEventListener("pointerleave", () => (pointer.strength = 0), options);
  document.addEventListener("visibilitychange", update, options);
  document.addEventListener("lattice:motion", toggle, options);
  document.addEventListener(
    "lattice:hash",
    () => {
      scene.mode(scene.post.material === scene.hash ? "dither" : "hash");
      if (!state.running) still();
    },
    options,
  );
  document.addEventListener(
    "lattice:diagnostics",
    () => {
      state.diagnostics?.dispose();
      state.diagnostics = state.diagnostics ? undefined : new Diagnostics();
    },
    options,
  );
  motion.addEventListener("change", update, options);
  scheme.addEventListener(
    "change",
    () => {
      colors();
      if (!state.running) still();
    },
    options,
  );
  control?.addEventListener("click", toggle, options);
  scene.canvas.addEventListener(
    "webglcontextlost",
    () => {
      scene.renderer.setAnimationLoop(null);
      state.running = false;
      delete container.dataset.ready;
    },
    options,
  );
  scene.canvas.addEventListener(
    "webglcontextrestored",
    () => {
      dispose();
      void mount(container);
    },
    options,
  );
  addEventListener(
    "pagehide",
    () => {
      dispose();
      addEventListener("pageshow", (event) => event.persisted && void mount(container), { once: true });
    },
    { once: true, signal: controller.signal },
  );
  import.meta.hot?.dispose(dispose);

  timer.connect(document);
  colors();
  measure();
  apply();
  await scene.compile();
  scene.canvas.setAttribute("aria-hidden", "true");
  container.append(scene.canvas);
  still();
  container.dataset.ready = "";
  resize.observe(container);
  intersection.observe(container);
}
