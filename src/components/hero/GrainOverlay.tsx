/**
 * Film grain over the whole night scene (direction §6, 0.4 s): the only
 * grain on the page, there is no noise pass in WebGL. A 128px feTurbulence
 * tile at 7 %, stepped by transform at 12 fps (compositor only). Static
 * under reduced motion. Sits above the intro stage, below sheets and gate.
 */
const TILE = 128;

const noise = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="${TILE}" height="${TILE}" filter="url(#n)"/></svg>`;

/** Twelve fixed offsets per second; any offset works because the tile repeats. */
const offsets: Array<[number, number]> = [
  [0, 0],
  [-37, 21],
  [54, -63],
  [-88, -12],
  [23, 77],
  [-61, -94],
  [96, 38],
  [-15, -49],
  [71, -27],
  [-104, 66],
  [42, 103],
  [-79, 9],
];

const keyframes = offsets
  .map(([x, y], i) => `${((i * 100) / offsets.length).toFixed(3)}%{transform:translate3d(${x}px,${y}px,0)}`)
  .join("");

const css = `@keyframes hero-grain{${keyframes}}
.hero-grain{position:absolute;inset:-${TILE}px;background-image:url("data:image/svg+xml,${encodeURIComponent(noise)}");background-size:${TILE}px ${TILE}px;opacity:.07;animation:hero-grain 1s steps(1,end) infinite;will-change:transform}
@media (prefers-reduced-motion:reduce){.hero-grain{animation:none}}
html[data-motion="reduce"] .hero-grain{animation:none}`;

export function GrainOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[46] overflow-hidden">
      <style href="hero-grain" precedence="medium">
        {css}
      </style>
      <div className="hero-grain" />
    </div>
  );
}
