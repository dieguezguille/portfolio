precision highp float;

in float intensity;
in float accent;

out vec4 color;

void main() {
  color = vec4(intensity, accent, 0.0, 1.0);
}
