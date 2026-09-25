precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float flatten;
uniform vec4 grid;
uniform float pulse;

vec3 drift(float seed) {
  return 0.04 * vec3(sin(time * 0.7 + seed * 6.283), sin(time * 0.53 + seed * 12.566), sin(time * 0.61 + seed * 18.85));
}

vec4 place(vec3 origin, vec3 target, float seed) {
  vec3 merged = vec3(origin.x, origin.yz * (1.0 - smoothstep(0.0, 0.6, flatten)));
  vec4 view = modelViewMatrix * vec4(merged + drift(seed) * (1.0 - flatten), 1.0);
  view.xyz = mix(view.xyz, vec3(grid.xy + target.xy * grid.z, -grid.w), smoothstep(0.4, 1.0, flatten));
  return view;
}

float fog(vec4 view) {
  return clamp(1.15 - (-view.z - grid.w + 2.5) / 5.0, 0.35, 1.0);
}
