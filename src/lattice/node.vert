in vec3 position;
in vec3 normal;
in vec3 origin;
in vec3 target;
in float layer;

uniform vec2 focus;
uniform vec2 zoom;

out float intensity;
out float accent;

void main() {
  vec4 view = place(origin, target, float(gl_InstanceID));
  float id = float(gl_InstanceID);
  float grow = 1.0 + 1.5 * (zoom.x * step(abs(id - focus.x), 0.5) + zoom.y * step(abs(id - focus.y), 0.5));
  view.xyz += mix(mat3(modelViewMatrix) * position, position, flatten) * grow;
  float shade = 0.55 + 0.45 * max(dot(normal, normalize(vec3(0.4, 0.8, 0.45))), 0.0);
  intensity = shade * fog(view) * (0.85 + 0.6 * pulse * layer);
  accent = 0.0;
  gl_Position = projectionMatrix * view;
}
