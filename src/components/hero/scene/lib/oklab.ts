import { Color } from "three";

/**
 * OKLab helpers. Flavor colors are interpolated in OKLab (direction §2):
 * the 50 % mix stays a plausible light color instead of sRGB mud.
 * Inputs and outputs are linear sRGB (three's working color space).
 */
export type Lab = { L: number; a: number; b: number };

export function linearToOklab(r: number, g: number, b: number): Lab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function oklabToLinear(lab: Lab, out: Color): Color {
  const l = (lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b) ** 3;
  const m = (lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b) ** 3;
  const s = (lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b) ** 3;
  return out.setRGB(
    Math.max(0, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    Math.max(0, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    Math.max(0, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  );
}

/** sRGB hex → OKLab (via three's color management, i.e. linear sRGB). */
export function hexToOklab(hex: string): Lab {
  const c = new Color(hex);
  return linearToOklab(c.r, c.g, c.b);
}

const tmp: Lab = { L: 0, a: 0, b: 0 };

/** Mixes two OKLab colors and writes the linear result into `out`. */
export function mixOklab(from: Lab, to: Lab, t: number, out: Color): Color {
  tmp.L = from.L + (to.L - from.L) * t;
  tmp.a = from.a + (to.a - from.a) * t;
  tmp.b = from.b + (to.b - from.b) * t;
  return oklabToLinear(tmp, out);
}
