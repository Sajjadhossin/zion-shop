/** Maps human color names (as stored on variants) to a display hex swatch. */
const COLOR_HEX: Record<string, string> = {
  white: "#ffffff",
  "off-white": "#f5f1e8",
  black: "#1a1a1a",
  "sky blue": "#7dd3fc",
  navy: "#1e3a5f",
  "royal blue": "#1d4ed8",
  maroon: "#7c2d33",
  red: "#dc2626",
  green: "#16a34a",
  teal: "#0d9488",
  pink: "#ec4899",
  mustard: "#d4a017",
  yellow: "#facc15",
  lavender: "#c4b5fd",
  denim: "#4a6fa5",
};

export function colorToHex(name: string): string {
  return COLOR_HEX[name.trim().toLowerCase()] ?? "#cbd5e1";
}

/** True for very light swatches that need a border to be visible on white. */
export function isLightColor(name: string): boolean {
  const light = ["white", "off-white", "yellow", "sky blue", "lavender", "mustard"];
  return light.includes(name.trim().toLowerCase());
}
