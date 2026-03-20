import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

/**
 * Helper: write content to a temporary starship.toml, open it,
 * wait for extension activation, then return the document, URI, and
 * a cleanup function.
 */
export async function openStarshipDoc(
  content: string,
): Promise<{ doc: vscode.TextDocument; uri: vscode.Uri; cleanup: () => void }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "starship-test-"));
  const filePath = path.join(tmpDir, "starship.toml");
  fs.writeFileSync(filePath, content, "utf8");
  const uri = vscode.Uri.file(filePath);
  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc);
  await sleep(2500);
  return {
    doc,
    uri,
    cleanup: () => {
      try {
        fs.unlinkSync(filePath);
        fs.rmdirSync(tmpDir);
      } catch {
        // ignore
      }
    },
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hoverToString(hovers: vscode.Hover[]): string {
  return hovers
    .flatMap((h) =>
      h.contents.map((c) =>
        typeof c === "string"
          ? c
          : c instanceof vscode.MarkdownString
            ? c.value
            : "value" in c
              ? (c as { value: string }).value
              : String(c),
      ),
    )
    .join("\n");
}
