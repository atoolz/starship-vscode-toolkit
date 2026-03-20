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

function hoverToString(hovers: vscode.Hover[]): string {
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

suite("Hover Provider", () => {
  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
  });

  test("should show hover for top-level options", async () => {
    const content = "command_timeout = 500\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      // Hover over "command_timeout" (position in the middle of the key)
      const position = new vscode.Position(0, 5);
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        uri,
        position,
      );
      assert.ok(hovers && hovers.length > 0, "Should return hover info");
      const text = hoverToString(hovers);
      assert.ok(
        text.includes("command_timeout"),
        `Hover should mention "command_timeout", got: ${text}`,
      );
      assert.ok(
        text.includes("number"),
        `Hover should mention the type "number", got: ${text}`,
      );
    } finally {
      cleanup();
    }
  });

  test("should show hover for module section names", async () => {
    const content = "[git_branch]\nsymbol = \"x\"\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      // Hover over the section header "[git_branch]"
      const position = new vscode.Position(0, 5);
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        uri,
        position,
      );
      assert.ok(hovers && hovers.length > 0, "Should return hover for section");
      const text = hoverToString(hovers);
      assert.ok(
        text.includes("git_branch"),
        `Hover should mention "git_branch", got: ${text}`,
      );
      assert.ok(
        text.toLowerCase().includes("branch"),
        `Hover should describe the module, got: ${text}`,
      );
    } finally {
      cleanup();
    }
  });

  test("should show hover for module options with type and default", async () => {
    const content =
      "[directory]\ntruncation_length = 3\nstyle = \"bold cyan\"\n";
    const { uri, cleanup } = await openStarshipDoc(content);
    try {
      // Hover over "truncation_length"
      const position = new vscode.Position(1, 5);
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        uri,
        position,
      );
      assert.ok(
        hovers && hovers.length > 0,
        "Should return hover for module option",
      );
      const text = hoverToString(hovers);
      assert.ok(
        text.includes("truncation_length"),
        `Hover should mention "truncation_length", got: ${text}`,
      );
      assert.ok(
        text.includes("number"),
        `Hover should mention type "number", got: ${text}`,
      );
      assert.ok(
        text.includes("3"),
        `Hover should mention default "3", got: ${text}`,
      );
    } finally {
      cleanup();
    }
  });

  test("should NOT show hover for non-starship content", async () => {
    // Create a regular toml file (not named starship.toml)
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "starship-test-"));
    const filePath = path.join(tmpDir, "other.toml");
    fs.writeFileSync(filePath, "key = 42\n", "utf8");
    const uri = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
    await sleep(2000);
    try {
      const position = new vscode.Position(0, 1);
      const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
        "vscode.executeHoverProvider",
        uri,
        position,
      );
      // Either null/empty or no hover contents from our extension
      const hasStarshipHover =
        hovers &&
        hovers.some((h) => {
          const text = hoverToString([h]);
          return text.includes("Starship") || text.includes("starship");
        });
      assert.ok(
        !hasStarshipHover,
        "Non-starship files should not get starship hover",
      );
    } finally {
      try {
        fs.unlinkSync(filePath);
        fs.rmdirSync(tmpDir);
      } catch {
        // ignore
      }
    }
  });
});
