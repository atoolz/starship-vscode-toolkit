import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

/**
 * Helper: write content to a temporary starship.toml, open it, wait for
 * extension activation, then return the document and URI.
 */
async function openStarshipDoc(
  content: string,
): Promise<{ doc: vscode.TextDocument; uri: vscode.Uri; cleanup: () => void }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "starship-test-"));
  const filePath = path.join(tmpDir, "starship.toml");
  fs.writeFileSync(filePath, content, "utf8");
  const uri = vscode.Uri.file(filePath);
  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc);
  await sleep(2000);
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

suite("Completion Provider", () => {
  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  });

  test("should provide top-level option completions", async () => {
    const content = "# starship config\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      // Position at the end of line 1 (empty line after comment)
      const position = new vscode.Position(1, 0);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const labels = completions.items.map((item) =>
        typeof item.label === "string" ? item.label : item.label.label,
      );
      assert.ok(
        labels.includes("format"),
        `Should include "format", got: ${labels.join(", ")}`,
      );
      assert.ok(
        labels.includes("command_timeout"),
        `Should include "command_timeout"`,
      );
      assert.ok(
        labels.includes("add_newline"),
        `Should include "add_newline"`,
      );
      assert.ok(
        labels.includes("scan_timeout"),
        `Should include "scan_timeout"`,
      );
    } finally {
      cleanup();
    }
  });

  test("should provide module section name completions", async () => {
    const content = "[\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      const position = new vscode.Position(0, 1);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const labels = completions.items.map((item) =>
        typeof item.label === "string" ? item.label : item.label.label,
      );
      const expected = [
        "character",
        "directory",
        "git_branch",
        "nodejs",
        "python",
        "rust",
      ];
      for (const mod of expected) {
        assert.ok(
          labels.includes(mod),
          `Should include module "${mod}", got: ${labels.join(", ")}`,
        );
      }
    } finally {
      cleanup();
    }
  });

  test("should provide options inside a module section", async () => {
    const content = "[character]\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      const position = new vscode.Position(1, 0);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const labels = completions.items.map((item) =>
        typeof item.label === "string" ? item.label : item.label.label,
      );
      const expected = ["disabled", "format", "success_symbol", "error_symbol"];
      for (const opt of expected) {
        assert.ok(
          labels.includes(opt),
          `Should include option "${opt}" in [character], got: ${labels.join(", ")}`,
        );
      }
    } finally {
      cleanup();
    }
  });

  test("should provide style keyword completions", async () => {
    const content = '[character]\nstyle = "';
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      // Position inside the style value string
      const position = new vscode.Position(1, 9);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const labels = completions.items.map((item) =>
        typeof item.label === "string" ? item.label : item.label.label,
      );
      // Should contain style modifiers and color names
      const expectedModifiers = ["bold", "italic", "dimmed", "underline"];
      const expectedColors = ["red", "green", "blue", "cyan"];
      for (const mod of expectedModifiers) {
        assert.ok(
          labels.includes(mod),
          `Should include style modifier "${mod}", got: ${labels.join(", ")}`,
        );
      }
      for (const color of expectedColors) {
        assert.ok(
          labels.includes(color),
          `Should include color "${color}", got: ${labels.join(", ")}`,
        );
      }
    } finally {
      cleanup();
    }
  });

  test("completions should have documentation", async () => {
    const content = "# config\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      const position = new vscode.Position(1, 0);
      const completions =
        await vscode.commands.executeCommand<vscode.CompletionList>(
          "vscode.executeCompletionItemProvider",
          uri,
          position,
        );
      assert.ok(completions, "Completions should be returned");
      const formatItem = completions.items.find((item) => {
        const label =
          typeof item.label === "string" ? item.label : item.label.label;
        return label === "format";
      });
      assert.ok(formatItem, 'Should find "format" completion item');
      assert.ok(
        formatItem.documentation,
        '"format" completion should have documentation',
      );
    } finally {
      cleanup();
    }
  });
});
