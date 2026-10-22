/**
 * Inverse of three's AgX tone mapping (the ToneMapping effect at the end of
 * the composer, exposure 1). Colors that must look exactly like their CSS
 * counterpart (the halo backdrop, the cores of the party lights) are authored
 * in display space and run through this inverse, so the filmic AgX curve
 * maps them back onto the intended color. Lit materials stay untouched and
 * get the filmic look.
 *
 * Matrices are the exact inverses of the ones in three's
 * tonemapping_pars_fragment (column-major like GLSL); the sigmoid is
 * inverted with four Newton steps (error < 1e-5 on [0, 1]).
 */
type Mat3 = readonly [readonly [number, number, number], readonly [number, number, number], readonly [number, number, number]];

const REC2020_TO_SRGB_INV: Mat3 = [
  [0.6274094, 0.0691248, 0.0164234],
  [0.3292603, 0.9195486, 0.0880478],
  [0.0432719, 0.0113208, 0.8956167],
];
const OUTSET_INV: Mat3 = [
  [0.899797, 0.111421, 0.111421],
  [0.0871996, 0.8755756, 0.0871996],
  [0.0130034, 0.0130034, 0.8013794],
];
const INSET_INV: Mat3 = [
  [1.1974411, -0.1964746, -0.1465574],
  [-0.1442615, 1.3540951, -0.1082841],
  [-0.0531796, -0.1576205, 1.2548415],
];
const SRGB_TO_REC2020_INV: Mat3 = [
  [1.6605123, -0.1245635, -0.0181675],
  [-0.5877047, 1.1329491, -0.1005596],
  [-0.0728664, -0.0082724, 1.118717],
];

const MIN_EV = -12.47393;
const MAX_EV = 4.026069;
const SIG_LO = -0.00232;
const SIG_HI = 0.99858;

const glslMat = (m: Mat3) => `mat3(${m.map((c) => `vec3(${c.map((v) => v.toFixed(7)).join(", ")})`).join(", ")})`;

/** GLSL: `vec3 agxInverse(vec3 displayLinear)` → scene-linear input for AgX. */
export const AGX_INVERSE_GLSL = /* glsl */ `
float agxSigmoid(float x) {
  float x2 = x * x;
  float x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}
float agxSigmoidSlope(float x) {
  float x2 = x * x;
  float x4 = x2 * x2;
  return 93.0 * x4 * x - 200.7 * x4 + 127.84 * x2 * x - 20.604 * x2 + 0.8596 * x + 0.1191;
}
float agxSigmoidInverse(float y) {
  y = clamp(y, ${SIG_LO.toFixed(5)}, ${SIG_HI.toFixed(5)});
  float x = 0.25 + 0.55 * y;
  for (int i = 0; i < 4; i++) {
    x = clamp(x - (agxSigmoid(x) - y) / max(0.05, agxSigmoidSlope(x)), 0.0, 1.0);
  }
  return x;
}
vec3 agxInverse(vec3 c) {
  vec3 v = ${glslMat(REC2020_TO_SRGB_INV)} * clamp(c, 0.0, 1.0);
  v = pow(max(v, vec3(0.0)), vec3(1.0 / 2.2));
  v = ${glslMat(OUTSET_INV)} * v;
  v = vec3(agxSigmoidInverse(v.x), agxSigmoidInverse(v.y), agxSigmoidInverse(v.z));
  v = exp2(v * ${(MAX_EV - MIN_EV).toFixed(6)} + ${MIN_EV.toFixed(6)});
  v = ${glslMat(INSET_INV)} * v;
  return ${glslMat(SRGB_TO_REC2020_INV)} * v;
}
`;

function mul(m: Mat3, v: [number, number, number]): [number, number, number] {
  return [
    m[0][0] * v[0] + m[1][0] * v[1] + m[2][0] * v[2],
    m[0][1] * v[0] + m[1][1] * v[1] + m[2][1] * v[2],
    m[0][2] * v[0] + m[1][2] * v[1] + m[2][2] * v[2],
  ];
}

function sigmoid(x: number): number {
  const x2 = x * x;
  const x4 = x2 * x2;
  return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232;
}

function sigmoidSlope(x: number): number {
  const x2 = x * x;
  const x4 = x2 * x2;
  return 93 * x4 * x - 200.7 * x4 + 127.84 * x2 * x - 20.604 * x2 + 0.8596 * x + 0.1191;
}

function sigmoidInverse(y: number): number {
  const t = Math.min(SIG_HI, Math.max(SIG_LO, y));
  let x = 0.25 + 0.55 * t;
  for (let i = 0; i < 4; i++) {
    x = Math.min(1, Math.max(0, x - (sigmoid(x) - t) / Math.max(0.05, sigmoidSlope(x))));
  }
  return x;
}

/** CPU twin of the GLSL: display-linear sRGB → scene-linear AgX input. */
export function agxInverse(r: number, g: number, b: number): [number, number, number] {
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  let v = mul(REC2020_TO_SRGB_INV, [clamp(r), clamp(g), clamp(b)]);
  v = [Math.max(0, v[0]) ** (1 / 2.2), Math.max(0, v[1]) ** (1 / 2.2), Math.max(0, v[2]) ** (1 / 2.2)];
  v = mul(OUTSET_INV, v);
  v = [sigmoidInverse(v[0]), sigmoidInverse(v[1]), sigmoidInverse(v[2])];
  const span = MAX_EV - MIN_EV;
  v = [2 ** (v[0] * span + MIN_EV), 2 ** (v[1] * span + MIN_EV), 2 ** (v[2] * span + MIN_EV)];
  v = mul(INSET_INV, v);
  return mul(SRGB_TO_REC2020_INV, v);
}
