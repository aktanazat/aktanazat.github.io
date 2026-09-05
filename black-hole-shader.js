// GLSL ES 3.00 source for the black hole illustration.
//
// Uniform contract (the host owns the GL state, this file owns only pixels):
//   uniform vec2  uResolution  drawing-buffer size in pixels
//   uniform float uTime        active seconds, monotonic, may be frozen
//   uniform vec2  uOrbit       (yaw, pitch) offsets in radians, (0,0) = default view
// The vertex stage reads gl_VertexID only: draw gl.TRIANGLES, 0, 3 with no
// attributes, no buffers, no VAO contents. The fragment stage writes one opaque
// colour and is white wherever the illustration has nothing to say, so the page
// needs no frame, no card and no alpha blending.

export const vertexShader = `#version 300 es
void main() {
  // One triangle that covers clip space: (-1,-1), (3,-1), (-1,3).
  vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const fragmentShader = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uOrbit;
out vec4 fragColor;

// Geometry in units of the horizon radius: M = 0.5 puts the horizon at r = 1
// and the photon sphere at r = 1.5, so the shadow edge sits at the exact
// critical impact parameter b = 3*sqrt(3)*M = 2.598.
const float HORIZON = 1.0;
const float SHADOW_B = 2.598;
const float MASS = 0.5;

// Camera: far enough that the disk is nearly orthographic (no wide-angle
// stretch in a small canvas), a narrow 22 degree field, and a 15 degree default
// tilt - enough to open the far side into the classic overhead arc while the
// near side still crosses in front of the shadow.
const float CAM_DIST = 20.0;
const float TAN_HALF = 0.394;
const float BASE_INCL = 0.26;
const float INCL_MIN = 0.06;
const float INCL_MAX = 0.72;

// ponytail: cap paths at 1.6 turns; raise MAX_STEPS for higher-order rings.
// Rays leave earlier once r > ESCAPE or they cross the horizon.
const float ESCAPE = 21.0;
const float DPHI = 0.060;
const int MAX_STEPS = 170;

// Disk: inner edge at the ISCO (r = 6M = 3), outer edge at 8 so the disk
// reaches roughly 2.6 shadow radii sideways and reads as a flat plane cut by a
// sphere rather than a ring around a ball.
const float DISK_IN = 3.0;
const float DISK_IN_SOFT = 0.30;
const float DISK_OUT = 8.0;
const float DISK_OUT_SOFT = 2.8;

const float KEPLER = 2.7;
const float BEAM = 2.1;
const float EXPOSURE = 1.5;
const float RADIAL_POW = 2.0;
const float ALPHA_GAIN = 3.5;
const float LANE_BASE = 0.42;
const float LANE_GAIN = 0.68;
const float LANE_POW = 2.8;

const vec3 COPPER = vec3(0.75, 0.14, 0.02);
const vec3 GOLD = vec3(1.00, 0.45, 0.08);
const vec3 IVORY = vec3(1.00, 0.92, 0.74);
const float IVORY_MIX = 0.70;
const float IVORY_E0 = 0.55;

// Page integration: local space is nearly black but only inside a tight aura,
// and the edge term guarantees pure white at the canvas border.
const vec3 SPACE = vec3(0.008);
const float AURA_W = 0.80;
const float HALO_AMP = 0.045;
const float HALO_DECAY = 1.2;
const float HALO_GATE0 = 0.97;
const float HALO_GATE1 = 1.06;
const float EDGE0 = 0.88;
const float EDGE1 = 1.02;

// Emission structure. Four radial bands, each with four azimuthal harmonics on
// its own mode set, so the sum never repeats into regular spokes. RQ trades
// spiral shear against radial streaking.
const vec4 HA = vec4(0.36, 0.32, 0.26, 0.18);
const float RQ = 2.1;
const vec4 RC = vec4(3.15, 4.10, 5.30, 6.90);
const vec4 WD = vec4(0.80, 1.00, 1.30, 1.70);
const vec4 PH = vec4(0.00, 2.10, 4.30, 1.20);
const vec4 MS[4] = vec4[4](
  vec4(3.0, 7.0, 13.0, 27.0),
  vec4(5.0, 11.0, 19.0, 31.0),
  vec4(4.0, 9.0, 17.0, 23.0),
  vec4(6.0, 13.0, 21.0, 29.0)
);

float bandPattern(float r, float a, float f, vec4 m) {
  vec4 rk = vec4(0.90, -1.50, 2.40, -3.60) * (RQ * f * r);
  return dot(HA, sin(m * a + rk + vec4(0.0, 1.7, 3.4, 5.2)));
}

// Gaussian-weighted blend of the bands. Each band rotates at its own Keplerian
// rate, so the pattern shears continuously instead of turning as one rigid
// texture - the differential flow is in the phase, not in a scrolling image.
float diskTexture(float r, float phi, float t) {
  float sum = 0.0;
  float wsum = 0.0;
  for (int j = 0; j < 4; j++) {
    float x = (r - RC[j]) / WD[j];
    float w = exp(-x * x);
    float omega = KEPLER * pow(RC[j], -1.5);
    sum += w * bandPattern(r, phi - omega * t + PH[j], 1.0 + 0.25 * float(j), MS[j]);
    wsum += w;
  }
  return sum / max(wsum, 1e-3);
}

// One disk crossing: rgb is emission already scaled by its own opacity, w is
// that opacity. Dense lanes occlude the page and show their own colour; thin
// gas stays transparent and the page reads through it, so faint material never
// smears the white into grey.
vec4 diskSample(vec3 p, vec3 dir, float t, float r) {
  float shape = smoothstep(DISK_IN, DISK_IN + DISK_IN_SOFT, r)
              * (1.0 - smoothstep(DISK_OUT - DISK_OUT_SOFT, DISK_OUT, r));
  if (shape <= 0.001) return vec4(0.0);

  float phi = atan(p.z, p.x);
  float lanes = pow(clamp(LANE_BASE + LANE_GAIN * diskTexture(r, phi, t), 0.0, 1.9), LANE_POW);
  lanes *= 0.94 + 0.06 * sin(t * 0.7 + r * 3.1);

  // Doppler and gravitational shift of the orbiting gas: the side coming toward
  // the camera is boosted and whitened, the receding side dims to copper. This
  // is where the left/right brightness asymmetry comes from, not from a painted
  // gradient.
  float beta = sqrt(MASS / r);
  float gamma = 1.0 / sqrt(max(1.0 - beta * beta, 1e-3));
  vec3 vdir = normalize(cross(vec3(0.0, 1.0, 0.0), p));
  float mu = dot(vdir, -dir);
  float shift = (1.0 / (gamma * (1.0 - beta * mu))) * sqrt(max(1.0 - HORIZON / r, 0.02));
  float boost = pow(shift, BEAM);

  float heat = 1.0 - smoothstep(DISK_IN, DISK_OUT * 0.92, r);
  vec3 tint = mix(COPPER, GOLD, smoothstep(0.0, 0.62, heat));
  tint = mix(tint, IVORY, IVORY_MIX * smoothstep(IVORY_E0, 1.0, heat));
  tint = mix(tint, IVORY, clamp((shift - 1.0) * 0.90, 0.0, 0.50));
  tint = mix(tint, COPPER, clamp((1.0 - shift) * 0.75, 0.0, 0.45));

  float alpha = 1.0 - exp(-shape * lanes * ALPHA_GAIN);
  float source = pow(DISK_IN / r, RADIAL_POW) * boost * EXPOSURE;
  return vec4(tint * alpha * source, alpha);
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  float aspect = max(uResolution.x / uResolution.y, 0.35);

  float yaw = uOrbit.x;
  float incl = clamp(BASE_INCL + uOrbit.y, INCL_MIN, INCL_MAX);
  vec3 ro = CAM_DIST * vec3(cos(incl) * sin(yaw), sin(incl), cos(incl) * cos(yaw));
  vec3 fwd = normalize(-ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(fwd + TAN_HALF * (uv.x * right + uv.y * up));

  // A photon path in Schwarzschild is planar, so instead of marching a 3D ray
  // through a field this integrates the exact orbit equation in that plane:
  // u = 1/r as a function of phi, u'' = 3*M*u^2 - u, by RK4. Bending is then a
  // property of the solution rather than of the step size, and the shadow edge
  // lands on the analytic critical impact parameter.
  vec3 nRaw = cross(ro, rd);
  float b = length(nRaw);
  vec3 n = nRaw / max(b, 1e-6);
  vec3 e1 = normalize(ro);
  vec3 e2 = normalize(cross(n, e1));
  float R0 = length(ro);
  float u = 1.0 / R0;
  float w = -dot(rd, e1) / (R0 * max(dot(rd, e2), 1e-6));

  // The orbit plane meets the disk plane along one line, so every disk crossing
  // is exactly phiL + k*PI. Crossings are solved, not searched: each one is a
  // sharp intersection, which is what keeps the lensed images crisp at 270px
  // instead of smeared by a plane-interpolated march.
  vec3 L = cross(n, vec3(0.0, 1.0, 0.0));
  float phiCross = atan(dot(L, e2), dot(L, e1));
  phiCross -= 3.14159265 * floor(phiCross / 3.14159265);
  if (phiCross <= 1e-4) phiCross += 3.14159265;

  float phi = 0.0;
  float next = phiCross;
  vec3 col = vec3(0.0);
  float trans = 1.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    if (u > 1.0 / HORIZON) break;
    if (u < 1.0 / ESCAPE && w < 0.0) break;

    // Crossings are PI apart and DPHI is 0.06, so at most one falls inside a
    // step. Taylor-step to the crossing angle, sample, resume.
    if (next <= phi + DPHI) {
      float dp = next - phi;
      float a0 = 3.0 * MASS * u * u - u;
      float uc = u + w * dp + 0.5 * a0 * dp * dp;
      float rc = 1.0 / uc;
      if (uc > 0.0 && rc > DISK_IN && rc < DISK_OUT) {
        float wc = w + a0 * dp;
        float cs = cos(next);
        float sn = sin(next);
        vec3 er = e1 * cs + e2 * sn;
        vec3 ep = -e1 * sn + e2 * cs;
        vec4 s = diskSample(er * rc, normalize(er * (-wc / (uc * uc)) + ep * rc), uTime, rc);
        col += s.rgb * trans;
        trans *= 1.0 - s.w;
      }
      next += 3.14159265;
      if (trans < 0.02) break;
    }

    float k1u = w;
    float k1w = 3.0 * MASS * u * u - u;
    float u2 = u + 0.5 * DPHI * k1u;
    float k2u = w + 0.5 * DPHI * k1w;
    float k2w = 3.0 * MASS * u2 * u2 - u2;
    float u3 = u + 0.5 * DPHI * k2u;
    float k3u = w + 0.5 * DPHI * k2w;
    float k3w = 3.0 * MASS * u3 * u3 - u3;
    float u4 = u + DPHI * k3u;
    float k4u = w + DPHI * k3w;
    float k4w = 3.0 * MASS * u4 * u4 - u4;
    u += (DPHI / 6.0) * (k1u + 2.0 * k2u + 2.0 * k3u + k4u);
    w += (DPHI / 6.0) * (k1w + 2.0 * k2w + 2.0 * k3w + k4w);
    phi += DPHI;
  }

  // Composite as layers over paper: white page, darkened near the hole by local
  // space, the disk occluding that background and radiating on top of it, then a
  // warm scattered bloom just outside the shadow. Nothing paints a vignette, so
  // the silhouette of the artwork is the physics and the border stays white.
  float aura = b < SHADOW_B ? 1.0 : exp(-(b - SHADOW_B) / AURA_W);
  float bloom = smoothstep(SHADOW_B * HALO_GATE0, SHADOW_B * HALO_GATE1, b)
              * exp(-(b - SHADOW_B) * HALO_DECAY) * HALO_AMP;

  vec3 emit = pow(col / (1.0 + col), vec3(0.4545));
  vec3 space = pow(SPACE / (1.0 + SPACE), vec3(0.4545));
  vec3 scene = mix(vec3(1.0), space, aura) * trans + emit + vec3(1.0, 0.80, 0.55) * bloom;

  float ndCanvas = length(vec2(uv.x / aspect, uv.y));
  float edge = 1.0 - smoothstep(EDGE0, EDGE1, ndCanvas);
  fragColor = vec4(clamp(mix(vec3(1.0), scene, edge), 0.0, 1.0), 1.0);
}
`;
