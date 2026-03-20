import * as vscode from "vscode";

export interface TomlContext {
  /** Current section name, e.g. "git_branch" or "custom.docker". Empty string = top-level. */
  section: string;
  /** Whether the cursor is inside a value (after =) */
  inValue: boolean;
  /** The key on the current line (if any) */
  currentKey: string;
  /** The current value text (partial, for style/format completion) */
  currentValue: string;
  /** Whether cursor is inside a string literal */
  inString: boolean;
}

/**
 * Determines the TOML context at a given position in a document.
 * This is a lightweight parser that handles the common starship.toml patterns.
 */
export function getTomlContext(
  document: vscode.TextDocument,
  position: vscode.Position,
): TomlContext {
  let section = "";
  const currentLineText = document.lineAt(position.line).text;

  // Walk backwards from the current line to find the current section header
  for (let i = position.line; i >= 0; i--) {
    const line = document.lineAt(i).text.trim();
    const sectionMatch = line.match(/^\[([^\]]+)\]\s*$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      break;
    }
  }

  // Check if we're in a value or key position on the current line
  const beforeCursor = currentLineText.substring(0, position.character);
  const equalsIndex = beforeCursor.indexOf("=");
  const inValue = equalsIndex >= 0;

  let currentKey = "";
  let currentValue = "";

  if (inValue) {
    currentKey = currentLineText.substring(0, equalsIndex).trim();
    currentValue = beforeCursor.substring(equalsIndex + 1).trim();
  } else {
    currentKey = beforeCursor.trim();
  }

  // Check if cursor is inside a string
  const inString = isInsideString(beforeCursor, position.character);

  return {
    section,
    inValue,
    currentKey,
    currentValue,
    inString,
  };
}

function isInsideString(text: string, _pos: number): boolean {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    }
  }

  return inSingle || inDouble;
}

/**
 * Checks if the document is a starship.toml file.
 */
export function isStarshipToml(document: vscode.TextDocument): boolean {
  const fileName = document.fileName;
  if (fileName.endsWith("starship.toml")) {
    return true;
  }
  return false;
}

/**
 * Parse all section headers from the document.
 * Returns an array of { name, line } objects.
 */
export function parseSections(
  document: vscode.TextDocument,
): Array<{ name: string; line: number; endLine: number }> {
  const sections: Array<{ name: string; line: number; endLine: number }> = [];

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i).text.trim();
    const match = line.match(/^\[([^\]]+)\]\s*$/);
    if (match) {
      // Close the previous section
      if (sections.length > 0) {
        sections[sections.length - 1].endLine = i - 1;
      }
      sections.push({ name: match[1], line: i, endLine: document.lineCount - 1 });
    }
  }

  return sections;
}

/**
 * Parse key-value pairs from a specific section in the document.
 */
export function parseSectionOptions(
  document: vscode.TextDocument,
  startLine: number,
  endLine: number,
): Array<{ key: string; value: string; line: number }> {
  const options: Array<{ key: string; value: string; line: number }> = [];

  for (let i = startLine + 1; i <= endLine && i < document.lineCount; i++) {
    const line = document.lineAt(i).text.trim();
    if (line === "" || line.startsWith("#")) continue;
    if (line.startsWith("[")) break;

    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (match) {
      options.push({ key: match[1], value: match[2].trim(), line: i });
    }
  }

  return options;
}

/**
 * Extract the string value from a TOML value, stripping quotes.
 */
export function extractStringValue(value: string): string | null {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return null;
}
