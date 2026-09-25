// cspell:ignore llvmpipe swiftshader
const gl = new OffscreenCanvas(1, 1).getContext("webgl2", { failIfMajorPerformanceCaveat: true });
const debug = gl?.getParameter(gl.RENDERER) === "WebKit WebGL" ? gl.getExtension("WEBGL_debug_renderer_info") : null;
const renderer: unknown = gl?.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
gl?.getExtension("WEBGL_lose_context")?.loseContext();
postMessage(typeof renderer === "string" && !/swiftshader|llvmpipe|software/i.test(renderer));
