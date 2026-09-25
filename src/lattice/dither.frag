precision highp float;
precision highp int;

uniform sampler2D map;
uniform float scale;
uniform float fade;
uniform vec3 foreground;
uniform vec3 highlight;

out vec4 color;

float bayer(ivec2 cell) {
  int value = 0;
  for (int bit = 0; bit < 3; bit++) {
    int u = (cell.x >> bit) & 1;
    int v = (cell.y >> bit) & 1;
    value = value * 4 + 2 * (u ^ v) + v;
  }
  return (float(value) + 0.5) / 64.0;
}

void main() {
  ivec2 cell = ivec2(gl_FragCoord.xy / scale);
  vec4 texel = texelFetch(map, cell, 0);
  float threshold = bayer(cell & 7);
  if (texel.g * fade > threshold) color = vec4(highlight, 1.0);
  else if (texel.r * fade > threshold) color = vec4(foreground, 1.0);
  else color = vec4(0.0);
}
