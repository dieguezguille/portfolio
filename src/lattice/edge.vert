in vec3 position;
in vec3 target;
in float node;

out float intensity;
out float accent;

void main() {
  vec4 view = place(position, target, node);
  intensity = 0.5 * fog(view);
  accent = 0.0;
  gl_Position = projectionMatrix * view;
}
