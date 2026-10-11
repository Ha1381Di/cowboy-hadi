#version 300 es
precision highp float;

/** The inverted view matrix */
uniform mat4 viewMatrix;
uniform vec3 iResolution;

uniform highp sampler2D groundTexture;

out vec4 O;

#define gameTime iResolution.z
#define viewPos viewMatrix[3]

/* 1 / Math.tan(fieldOfViewRadians / 2) */
const float fieldOfViewAmount = 1.73205;

void main() {
  vec2 fragCoord = (gl_FragCoord.xy / iResolution.xy) * 2. - 1.;
  vec3 ray =
    normalize(viewMatrix * vec4(fragCoord.x * -(iResolution.x / iResolution.y), -fragCoord.y, fieldOfViewAmount, 0.)).xyz;
  float rayTracedLavalDistance = (-32. - viewPos.y) / ray.y;
  float multiplier = (1. - clamp(abs(rayTracedLavalDistance / 9999.), 0., 1.));

  O = vec4(0, 0, 0, 1);

  if (multiplier > 0.01) {
    if (rayTracedLavalDistance > 0.) {
      // Render summer sky with light clouds
      float c = cos(gameTime / 120.), s = sin(gameTime / 120.);
      vec3 skyRay = ray;
      skyRay.xz *= mat2(c, s, -s, c);
      
      // Summer sky blue
      vec3 skyColor = vec3(0.35, 0.65, 1.0);
      
      // Cloud generation using the ground texture
      float cloudNoise = texture(groundTexture, skyRay.xz * 0.15 + skyRay.y * 0.1).y;
      // Make clouds soft and sparse
      float cloudMask = smoothstep(0.48, 0.65, cloudNoise);
      
      // Fade clouds at the horizon
      cloudMask *= clamp(ray.y * 3.0, 0.0, 1.0);
      
      // Mix sky color with white clouds
      O.xyz = mix(skyColor, vec3(1.0), cloudMask);

    } else {
      // Render slow moving blue ocean
      ray = viewPos.xyz + ray * rayTracedLavalDistance;
      float wave = texture(groundTexture, ray.xz / 150. + vec2(sin(ray.z / 35. + gameTime * 0.2), cos(ray.x / 25. + gameTime * 0.2)) / 80.).y;
      multiplier *= 0.9 - wave;
      O.x = multiplier * 0.06;
      O.y = multiplier * multiplier * multiplier * 0.48;
      O.z = multiplier;
    }
  }
}