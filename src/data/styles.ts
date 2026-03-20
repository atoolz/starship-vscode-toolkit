export const styleModifiers: string[] = [
  "bold",
  "italic",
  "underline",
  "dimmed",
  "inverted",
  "blink",
  "hidden",
  "strikethrough",
];

export const namedColors: string[] = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "purple",
  "cyan",
  "white",
  "bright-black",
  "bright-red",
  "bright-green",
  "bright-yellow",
  "bright-blue",
  "bright-purple",
  "bright-cyan",
  "bright-white",
];

export const colorPrefixes: string[] = ["fg:", "bg:"];

/**
 * Validates a starship style string.
 * Valid tokens: modifiers, named colors, fg:#hex, bg:#hex, or bare #hex, or ANSI 0-255.
 */
export function validateStyleString(style: string): string | null {
  const tokens = style.trim().split(/\s+/);
  for (const token of tokens) {
    if (styleModifiers.includes(token)) continue;
    if (namedColors.includes(token)) continue;
    if (/^(fg:|bg:)?#[0-9a-fA-F]{6}$/.test(token)) continue;
    if (/^(fg:|bg:)?#[0-9a-fA-F]{3}$/.test(token)) continue;
    if (/^(fg:|bg:)?\d{1,3}$/.test(token)) {
      const numPart = token.replace(/^(fg:|bg:)?/, "");
      const num = parseInt(numPart, 10);
      if (num >= 0 && num <= 255) continue;
    }
    if (
      token.startsWith("fg:") &&
      namedColors.includes(token.substring(3))
    )
      continue;
    if (
      token.startsWith("bg:") &&
      namedColors.includes(token.substring(3))
    )
      continue;
    return `Invalid style token: "${token}"`;
  }
  return null;
}
