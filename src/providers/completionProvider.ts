import * as vscode from "vscode";
import { getTomlContext, isStarshipToml } from "../utils/tomlParser";
import { starshipModules, findModule, allModuleNames } from "../data/modules";
import { topLevelOptions } from "../data/topLevel";
import { styleModifiers, namedColors } from "../data/styles";

export class StarshipCompletionProvider
  implements vscode.CompletionItemProvider
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext,
  ): vscode.CompletionItem[] | undefined {
    if (!isStarshipToml(document)) {
      return undefined;
    }

    const ctx = getTomlContext(document, position);
    const lineText = document.lineAt(position.line).text;

    // Section header completion: user is typing [...]
    if (lineText.trim().startsWith("[")) {
      return this.completeSectionHeader(lineText, position);
    }

    // Inside a value
    if (ctx.inValue) {
      return this.completeValue(ctx, document, position);
    }

    // Key completion
    return this.completeKey(ctx);
  }

  private completeSectionHeader(
    lineText: string,
    _position: vscode.Position,
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Extract what's been typed so far inside the brackets
    const bracketContent = lineText.match(/\[([^\]]*)/);
    const prefix = bracketContent ? bracketContent[1] : "";

    for (const moduleName of allModuleNames) {
      if (moduleName === "custom") {
        // Suggest custom.name pattern
        const item = new vscode.CompletionItem(
          "custom.",
          vscode.CompletionItemKind.Module,
        );
        item.detail = "Custom module";
        item.documentation = new vscode.MarkdownString(
          "Define a custom module. Use `[custom.name]` where `name` is your module identifier.",
        );
        item.insertText = "custom.";
        items.push(item);
        continue;
      }

      const mod = findModule(moduleName);
      if (!mod) continue;

      const item = new vscode.CompletionItem(
        moduleName,
        vscode.CompletionItemKind.Module,
      );
      item.detail = `Starship module`;
      item.documentation = new vscode.MarkdownString(
        `${mod.description}\n\n[Documentation](${mod.docUrl})`,
      );
      items.push(item);
    }

    return items;
  }

  private completeKey(ctx: { section: string }): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    if (ctx.section === "") {
      // Top-level options
      for (const opt of topLevelOptions) {
        const item = new vscode.CompletionItem(
          opt.name,
          vscode.CompletionItemKind.Property,
        );
        item.detail = `${opt.type} (default: ${opt.default})`;
        item.documentation = new vscode.MarkdownString(
          `${opt.description}\n\n[Documentation](${opt.docUrl})`,
        );
        item.insertText = this.keyValueSnippet(opt.name, opt.type, opt.default);
        items.push(item);
      }
    } else {
      // Module-specific options
      const mod = findModule(ctx.section);
      if (mod) {
        for (const opt of mod.options) {
          const item = new vscode.CompletionItem(
            opt.name,
            vscode.CompletionItemKind.Property,
          );
          item.detail = `${opt.type} (default: ${opt.default})`;
          item.documentation = new vscode.MarkdownString(opt.description);
          item.insertText = this.keyValueSnippet(opt.name, opt.type, opt.default);
          items.push(item);
        }
      }
    }

    return items;
  }

  private completeValue(
    ctx: {
      section: string;
      currentKey: string;
      currentValue: string;
      inString: boolean;
    },
    _document: vscode.TextDocument,
    _position: vscode.Position,
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const key = ctx.currentKey;

    // Style completions
    if (key === "style" || key.endsWith("_style")) {
      return this.completeStyle(ctx.currentValue);
    }

    // Format variable completions
    if (key === "format" && ctx.inString) {
      return this.completeFormatVariables(ctx.section);
    }

    // Boolean completions
    const mod = ctx.section === "" ? null : findModule(ctx.section);
    const optionDef = mod
      ? mod.options.find((o) => o.name === key)
      : topLevelOptions.find((o) => o.name === key);

    if (optionDef?.type === "boolean") {
      items.push(
        new vscode.CompletionItem("true", vscode.CompletionItemKind.Value),
        new vscode.CompletionItem("false", vscode.CompletionItemKind.Value),
      );
    }

    return items;
  }

  private completeStyle(currentValue: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const existingTokens = currentValue
      .replace(/^["']/, "")
      .split(/\s+/)
      .filter(Boolean);

    // Suggest modifiers
    for (const mod of styleModifiers) {
      if (existingTokens.includes(mod)) continue;
      const item = new vscode.CompletionItem(
        mod,
        vscode.CompletionItemKind.Keyword,
      );
      item.detail = "Style modifier";
      items.push(item);
    }

    // Suggest named colors
    for (const color of namedColors) {
      if (existingTokens.includes(color)) continue;
      const item = new vscode.CompletionItem(
        color,
        vscode.CompletionItemKind.Color,
      );
      item.detail = "Named color";
      items.push(item);
    }

    // Suggest fg: and bg: prefixed colors
    const fgItem = new vscode.CompletionItem(
      "fg:#",
      vscode.CompletionItemKind.Color,
    );
    fgItem.detail = "Foreground hex color";
    fgItem.insertText = new vscode.SnippetString("fg:#${1:000000}");
    items.push(fgItem);

    const bgItem = new vscode.CompletionItem(
      "bg:#",
      vscode.CompletionItemKind.Color,
    );
    bgItem.detail = "Background hex color";
    bgItem.insertText = new vscode.SnippetString("bg:#${1:000000}");
    items.push(bgItem);

    return items;
  }

  private completeFormatVariables(section: string): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];
    const mod = findModule(section);

    if (mod) {
      for (const v of mod.formatVariables) {
        const item = new vscode.CompletionItem(
          `$${v}`,
          vscode.CompletionItemKind.Variable,
        );
        item.detail = `Format variable for ${mod.name}`;
        item.insertText = `$${v}`;
        items.push(item);
      }
    }

    return items;
  }

  private keyValueSnippet(
    name: string,
    type: string,
    defaultValue: string,
  ): vscode.SnippetString {
    switch (type) {
      case "string":
        return new vscode.SnippetString(
          `${name} = "\${1:${defaultValue.replace(/^"|"$/g, "")}}"`,
        );
      case "boolean":
        return new vscode.SnippetString(
          `${name} = \${1|true,false|}`,
        );
      case "number":
        return new vscode.SnippetString(
          `${name} = \${1:${defaultValue}}`,
        );
      case "array":
        return new vscode.SnippetString(`${name} = [\${1}]`);
      case "object":
        return new vscode.SnippetString(`${name} = \${1:{}}`);
      default:
        return new vscode.SnippetString(`${name} = \${1:${defaultValue}}`);
    }
  }
}
