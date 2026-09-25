// cspell:ignore lerp
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  GLSL3,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  LineSegments,
  MathUtils,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  RawShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

import common from "./common.glsl?raw";
import dither from "./dither.frag?raw";
import edge from "./edge.vert?raw";
import hash from "./hash.frag?raw";
import lattice from "./lattice";
import fragment from "./lattice.frag?raw";
import node from "./node.vert?raw";
import packet from "./packet.vert?raw";
import post from "./post.vert?raw";

export default class Scene {
  readonly canvas = document.createElement("canvas");
  readonly renderer = new WebGLRenderer({
    canvas: this.canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
  });
  readonly camera = new PerspectiveCamera(32, 1, 0.1, 100);
  readonly root = new Group();
  readonly target = new WebGLRenderTarget(1, 1, { minFilter: NearestFilter, magFilter: NearestFilter });
  readonly uniforms = {
    time: { value: 0 },
    flatten: { value: 0 },
    grid: { value: new Vector4() },
    pulse: { value: 0 },
    focus: { value: new Vector2(-1, -1) },
    zoom: { value: new Vector2() },
  };
  readonly screen = {
    map: { value: this.target.texture },
    scale: { value: 2 },
    fade: { value: 1 },
    time: { value: 0 },
    pointer: { value: new Vector2() },
    well: { value: 0 },
    radius: { value: 0 },
    foreground: { value: new Color() },
    highlight: { value: new Color() },
  };
  readonly post: Mesh<BufferGeometry, RawShaderMaterial>;
  readonly dither: RawShaderMaterial;
  readonly hash: RawShaderMaterial;
  readonly packets: InstancedMesh<BoxGeometry, RawShaderMaterial>;
  readonly lines: LineSegments<BufferGeometry, RawShaderMaterial>;
  readonly nodes: InstancedMesh<BoxGeometry, RawShaderMaterial>;
  readonly buffer = new Vector2();
  readonly positions: Float32Array;
  readonly targets: Float32Array;
  readonly point = new Vector3();
  readonly anchor = new Vector3();
  distance = 10;

  constructor() {
    const { positions, targets, layers, edges } = lattice(8453);
    this.positions = positions;
    this.targets = targets;
    const flows = Array.from({ length: Math.ceil(edges.length / 6) }, (_, index) => index * 3);

    const box = new BoxGeometry(0.1, 0.1, 0.1);
    box.setAttribute("origin", new InstancedBufferAttribute(positions, 3));
    box.setAttribute("target", new InstancedBufferAttribute(targets, 3));
    box.setAttribute("layer", new InstancedBufferAttribute(layers, 1));
    this.nodes = new InstancedMesh(box, this.material(node), positions.length / 3);

    const segments = new BufferGeometry();
    segments.setAttribute("position", new BufferAttribute(gather(positions, edges, 3), 3));
    segments.setAttribute("target", new BufferAttribute(gather(targets, edges, 3), 3));
    segments.setAttribute("node", new BufferAttribute(Float32Array.from(edges), 1));
    this.lines = new LineSegments(segments, this.material(edge));

    const departures = Array.from(flows, (flow) => edges[flow * 2] ?? 0);
    const arrivals = Array.from(flows, (flow) => edges[flow * 2 + 1] ?? 0);
    const cube = new BoxGeometry(0.05, 0.05, 0.05);
    cube.setAttribute("start", new InstancedBufferAttribute(gather(positions, departures, 3), 3));
    cube.setAttribute("end", new InstancedBufferAttribute(gather(positions, arrivals, 3), 3));
    cube.setAttribute("departure", new InstancedBufferAttribute(gather(targets, departures, 3), 3));
    cube.setAttribute("arrival", new InstancedBufferAttribute(gather(targets, arrivals, 3), 3));
    const pairs = Float32Array.from(departures.flatMap((departure, index) => [departure, arrivals[index] ?? 0]));
    cube.setAttribute("nodes", new InstancedBufferAttribute(pairs, 2));
    cube.setAttribute(
      "phase",
      new InstancedBufferAttribute(
        Float32Array.from(flows, (_, index) => (index * 0.618) % 1),
        1,
      ),
    );
    cube.setAttribute(
      "speed",
      new InstancedBufferAttribute(
        Float32Array.from(flows, (_, index) => 0.22 + (index % 5) * 0.04),
        1,
      ),
    );
    this.packets = new InstancedMesh(cube, this.material(packet), flows.length);

    for (const object of [this.nodes, this.lines, this.packets]) object.frustumCulled = false;
    this.root.add(this.nodes, this.lines, this.packets);

    const triangle = new BufferGeometry();
    triangle.setAttribute("position", new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const screen = (fragmentShader: string) =>
      new RawShaderMaterial({
        vertexShader: post,
        fragmentShader,
        glslVersion: GLSL3,
        uniforms: this.screen,
        depthTest: false,
        depthWrite: false,
      });
    this.dither = screen(dither);
    this.hash = screen(hash);
    this.post = new Mesh(triangle, this.hash);
    this.post.frustumCulled = false;

    this.renderer.setClearColor(0x00_00_00, 0);
    this.renderer.info.autoReset = false;
  }

  private material(vertex: string) {
    return new RawShaderMaterial({
      vertexShader: `${common}\n${vertex}`,
      fragmentShader: fragment,
      glslVersion: GLSL3,
      uniforms: this.uniforms,
    });
  }

  async compile() {
    if (!this.renderer.extensions.has("KHR_parallel_shader_compile")) {
      this.renderer.compile(this.root, this.camera);
      this.renderer.compile(this.post, this.camera);
      return;
    }
    await this.renderer.compileAsync(this.root, this.camera);
    await this.renderer.compileAsync(this.post, this.camera);
  }

  resize(width: number, height: number, dpr: number, divisor: number) {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.renderer.getDrawingBufferSize(this.buffer);
    this.target.setSize(Math.ceil(this.buffer.x / divisor), Math.ceil(this.buffer.y / divisor));
    this.screen.scale.value = divisor;
    this.screen.radius.value = 48 * dpr;

    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.root.rotation.z = aspect < 1 ? -Math.PI / 2.6 : -Math.PI / 14;

    const half = Math.tan((this.camera.fov * Math.PI) / 360);
    this.distance = 2.9 / (half * Math.min(1, aspect));
    const extent = 2 * this.distance * half;
    this.uniforms.grid.value.set(0, extent * -0.48, extent * aspect, this.distance);
  }

  hover(x: number, y: number, strength: number, ease: number) {
    const { focus, zoom, flatten, grid } = this.uniforms;
    const merge = MathUtils.smoothstep(flatten.value, 0, 0.6);
    const settle = MathUtils.smoothstep(flatten.value, 0.4, 1);
    let nearest = -1;
    let best = (this.screen.radius.value * 2.5) ** 2;
    for (let index = 0; index < this.positions.length / 3; index++) {
      this.anchor.set(
        grid.value.x + (this.targets[index * 3] ?? 0) * grid.value.z,
        grid.value.y + (this.targets[index * 3 + 1] ?? 0) * grid.value.z,
        -grid.value.w,
      );
      this.point.fromArray(this.positions, index * 3);
      this.point
        .set(this.point.x, this.point.y * (1 - merge), this.point.z * (1 - merge))
        .applyMatrix4(this.root.matrixWorld)
        .applyMatrix4(this.camera.matrixWorldInverse)
        .lerp(this.anchor, settle)
        .applyMatrix4(this.camera.projectionMatrix);
      const distance =
        ((((this.point.x - x) * this.buffer.x) ** 2 + ((this.point.y - y) * this.buffer.y) ** 2) / 4) *
        (index === focus.value.x ? 0.5 : 1);
      if (distance >= best) continue;
      [nearest, best] = [index, distance];
      this.screen.pointer.value.set(((this.point.x + 1) / 2) * this.buffer.x, ((this.point.y + 1) / 2) * this.buffer.y);
    }
    if (nearest !== focus.value.x) {
      focus.value.set(nearest, focus.value.x);
      zoom.value.set(0, zoom.value.x);
    }
    zoom.value.x += ((nearest < 0 ? 0 : strength) - zoom.value.x) * ease;
    zoom.value.y -= zoom.value.y * ease;
    this.screen.well.value = zoom.value.x;
  }

  mode(name: "dither" | "hash") {
    this.post.material = name === "hash" ? this.hash : this.dither;
  }

  density(ratio: number) {
    this.packets.count = Math.max(1, Math.round(this.packets.instanceMatrix.count * ratio));
  }

  colors(foreground: string, highlight: string) {
    this.screen.foreground.value.setStyle(foreground).convertLinearToSRGB();
    this.screen.highlight.value.setStyle(highlight).convertLinearToSRGB();
  }

  render(time: number, orbit = 0) {
    this.uniforms.time.value = time;
    this.screen.time.value = time;
    this.uniforms.pulse.value = Math.exp(-((time % 2) / 2) * 7);
    const azimuth = 0.35 * Math.sin(time * 0.07) + orbit * 0.4;
    const elevation = 1.25 - orbit * 0.3;
    this.camera.position.setFromSphericalCoords(this.distance, elevation, azimuth);
    this.camera.lookAt(0, 0, 0);
    this.root.scale.setScalar(1 + 0.015 * Math.sin(time * 1.05));

    this.renderer.info.reset();
    this.renderer.setRenderTarget(this.target);
    this.renderer.clear();
    this.renderer.render(this.root, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.post, this.camera);
  }

  dispose() {
    for (const object of [this.nodes, this.lines, this.packets, this.post]) {
      object.geometry.dispose();
      object.material.dispose();
    }
    this.dither.dispose();
    this.hash.dispose();
    this.nodes.dispose();
    this.packets.dispose();
    this.target.dispose();
    this.renderer.dispose();
  }
}

function gather(source: Float32Array, indices: ArrayLike<number>, size: number) {
  return Float32Array.from(
    { length: indices.length * size },
    (_, offset) => source[(indices[Math.floor(offset / size)] ?? 0) * size + (offset % size)] ?? 0,
  );
}
