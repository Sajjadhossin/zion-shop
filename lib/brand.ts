/**
 * Derives a full brand color ramp from a single primary hex, so a white-label
 * customer only needs to pick one colour in admin settings and the whole theme
 * (buttons, accents, tints) follows. Returns CSS custom-property declarations
 * that override the defaults in globals.css, or "" if no valid colour is set.
 */
function parseHex(input?: string | null): [number, number, number] | null {
  if (!input) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  const h = m[1];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

const toHex = (r: number, g: number, b: number) =>
  "#" +
  [r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("");

const mix = (
  rgb: [number, number, number],
  target: [number, number, number],
  amt: number
): [number, number, number] => [
  rgb[0] + (target[0] - rgb[0]) * amt,
  rgb[1] + (target[1] - rgb[1]) * amt,
  rgb[2] + (target[2] - rgb[2]) * amt,
];

export function brandRamp(primary?: string | null): string {
  const base = parseHex(primary);
  if (!base) return "";
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [0, 0, 0];

  const stops: Record<number, [number, number, number]> = {
    50: mix(base, white, 0.92),
    100: mix(base, white, 0.82),
    500: mix(base, white, 0.12),
    600: base,
    700: mix(base, black, 0.15),
    900: mix(base, black, 0.45),
  };

  return Object.entries(stops)
    .map(([k, v]) => `--color-brand-${k}:${toHex(v[0], v[1], v[2])};`)
    .join("");
}
