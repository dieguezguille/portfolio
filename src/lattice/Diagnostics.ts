import type Governor from "./Governor";
import type Scene from "./Scene";

export default class Diagnostics {
  private frames = 0;
  private elapsed = 0;
  readonly element = document.createElement("pre");

  constructor() {
    this.element.className = "diagnostics";
    this.element.setAttribute("aria-hidden", "true");
    this.element.textContent = "system status\nwarming up";
    document.body.append(this.element);
  }

  frame(delta: number, scene: Scene, governor: Governor) {
    this.frames += 1;
    this.elapsed += delta;
    if (this.elapsed < 0.5) return;
    const { calls, triangles, lines } = scene.renderer.info.render;
    this.element.textContent = [
      "system status",
      `fps      ${Math.round(this.frames / this.elapsed)}`,
      `frame    ${((this.elapsed / this.frames) * 1000).toFixed(1)} ms`,
      `dpr      ${scene.renderer.getPixelRatio().toFixed(2)}`,
      `tier     ${governor.current.name}`,
      `calls    ${calls}`,
      `tris     ${triangles}`,
      `lines    ${lines}`,
      `backend  webgl2`,
    ].join("\n");
    this.frames = 0;
    this.elapsed = 0;
  }

  dispose() {
    this.element.remove();
  }
}
