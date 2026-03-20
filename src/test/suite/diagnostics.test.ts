import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

async function openStarshipDoc(
  content: string,
): Promise<{ doc: vscode.TextDocument; uri: vscode.Uri; cleanup: () => void }> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "starship-test-"));
  const filePath = path.join(tmpDir, "starship.toml");
  fs.writeFileSync(filePath, content, "utf8");
  const uri = vscode.Uri.file(filePath);
  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc);
  // Wait for extension activation and diagnostics computation
  await sleep(3000);
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

suite("Diagnostics Provider", () => {
  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    await sleep(500);
  });

  test("should warn about unknown module sections", async () => {
    const content = "[nonexistent_module]\ndisabled = false\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const unknownModule = diagnostics.find(
        (d) =>
          d.message.includes("Unknown Starship module") &&
          d.message.includes("nonexistent_module"),
      );
      assert.ok(
        unknownModule,
        `Should warn about unknown module, got: ${diagnostics.map((d) => d.message).join("; ")}`,
      );
      assert.strictEqual(
        unknownModule.severity,
        vscode.DiagnosticSeverity.Warning,
      );
    } finally {
      cleanup();
    }
  });

  test("should warn about unknown options within known modules", async () => {
    const content = "[character]\nunknown_option = true\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const unknownOpt = diagnostics.find(
        (d) =>
          d.message.includes("Unknown option") &&
          d.message.includes("unknown_option"),
      );
      assert.ok(
        unknownOpt,
        `Should warn about unknown option, got: ${diagnostics.map((d) => d.message).join("; ")}`,
      );
      assert.strictEqual(
        unknownOpt.severity,
        vscode.DiagnosticSeverity.Warning,
      );
    } finally {
      cleanup();
    }
  });

  test("valid config should produce zero diagnostics", async () => {
    const content = [
      "format = \"$all\"",
      "command_timeout = 500",
      "add_newline = true",
      "",
      "[character]",
      'success_symbol = "[>](bold green)"',
      'error_symbol = "[x](bold red)"',
      "",
      "[directory]",
      "truncation_length = 3",
      'style = "bold cyan"',
      "",
      "[git_branch]",
      'symbol = "B "',
      "disabled = false",
    ].join("\n");
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      assert.strictEqual(
        diagnostics.length,
        0,
        `Valid config should have 0 diagnostics, got ${diagnostics.length}: ${diagnostics.map((d) => d.message).join("; ")}`,
      );
    } finally {
      cleanup();
    }
  });

  test("should report multiple errors in one file", async () => {
    const content = [
      "unknown_top_option = true",
      "",
      "[nonexistent_module]",
      "disabled = false",
      "",
      "[character]",
      "unknown_option = true",
    ].join("\n");
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      assert.ok(
        diagnostics.length >= 3,
        `Should report at least 3 diagnostics, got ${diagnostics.length}: ${diagnostics.map((d) => d.message).join("; ")}`,
      );

      const hasUnknownTop = diagnostics.some((d) =>
        d.message.includes("Unknown top-level option"),
      );
      const hasUnknownModule = diagnostics.some((d) =>
        d.message.includes("Unknown Starship module"),
      );
      const hasUnknownOpt = diagnostics.some((d) =>
        d.message.includes("Unknown option"),
      );

      assert.ok(hasUnknownTop, "Should have unknown top-level option warning");
      assert.ok(hasUnknownModule, "Should have unknown module warning");
      assert.ok(hasUnknownOpt, "Should have unknown option warning");
    } finally {
      cleanup();
    }
  });

  test("should report type mismatches", async () => {
    const content = 'command_timeout = "not a number"\n';
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const typeMismatch = diagnostics.find((d) =>
        d.message.includes("Type mismatch"),
      );
      assert.ok(
        typeMismatch,
        `Should report type mismatch, got: ${diagnostics.map((d) => d.message).join("; ")}`,
      );
      assert.strictEqual(
        typeMismatch.severity,
        vscode.DiagnosticSeverity.Error,
      );
    } finally {
      cleanup();
    }
  });
});
