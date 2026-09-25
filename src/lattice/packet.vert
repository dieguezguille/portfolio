in vec3 position;
in vec3 start;
in vec3 end;
in vec3 departure;
in vec3 arrival;
in vec2 nodes;
in float phase;
in float speed;

out float intensity;
out float accent;

void main() {
  float progress = fract(time * speed + phase);
  vec4 view = mix(place(start, departure, nodes.x), place(end, arrival, nodes.y), progress);
  view.xyz += position;
  intensity = 1.0;
  accent = smoothstep(0.0, 0.1, progress) * (1.0 - smoothstep(0.9, 1.0, progress));
  gl_Position = projectionMatrix * view;
}
