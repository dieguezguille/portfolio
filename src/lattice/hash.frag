precision highp float;
precision highp int;

uniform sampler2D map;
uniform float scale;
uniform float fade;
uniform float time;
uniform vec2 pointer;
uniform float well;
uniform float radius;
uniform vec3 foreground;
uniform vec3 highlight;

out vec4 color;

const int glyphs[16] = int[16](
  31599, 11415, 29671, 29647, 23497, 31183, 31215, 29257,
  31727, 31695, 31725, 27566, 31015, 27502, 31207, 31204
);

float random(vec2 point) {
  return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy / scale);
  ivec2 cell = texel / ivec2(4, 6);
  ivec2 local = texel - cell * ivec2(4, 6);
  vec4 sampled = max(
    max(texelFetch(map, cell * ivec2(4, 6) + ivec2(1, 1), 0), texelFetch(map, cell * ivec2(4, 6) + ivec2(1, 4), 0)),
    max(texelFetch(map, cell * ivec2(4, 6) + ivec2(0, 2), 0), texelFetch(map, cell * ivec2(4, 6) + ivec2(2, 3), 0))
  );
  float seed = random(vec2(cell));
  vec2 center = (vec2(cell * ivec2(4, 6)) + vec2(2.0, 3.0)) * scale;
  float decoded = well * (1.0 - smoothstep(radius * 0.5, radius, distance(center, pointer)));
  float tick = decoded > 0.5 ? 0.0 : floor(time * 1.5 + seed * 8.0);
  int glyph = glyphs[int(random(vec2(cell) + tick) * 16.0) & 15];
  int row = 5 - local.y;
  bool ink = local.x < 3 && row < 5 && row >= 0 && ((glyph >> (14 - row * 3 - local.x)) & 1) == 1;
  float threshold = 0.2 - 0.12 * decoded;
  if (ink && sampled.g * fade > threshold) color = vec4(highlight, 1.0);
  else if (ink && sampled.r * fade > threshold) color = vec4(foreground, 1.0);
  else color = vec4(0.0);
}
