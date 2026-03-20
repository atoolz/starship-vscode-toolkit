import * as vscode from "vscode";
import { isStarshipToml, getTomlContext } from "../utils/tomlParser";
import { findModule, allModuleNames } from "../data/modules";
import { topLevelOptions } from "../data/topLevel";

export class StarshipHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
  ): vscode.Hover | undefined {
    if (!isStarshipToml(document)) {
      return undefined;
    }

    const lineText = document.lineAt(position.line).text;

    // Hover over section headers
    const sectionMatch = lineText.match(/^\[([^\]]+)\]/);
    if (sectionMatch) {
      return this.hoverSection(sectionMatch[1], position);
    }

    // Hover over keys
    const ctx = getTomlContext(document, position);
    if (!ctx.inValue) {
      return this.hoverKey(lineText, position, ctx.section);
    }

    return undefined;
  }

  private hoverSection(
    sectionName: string,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    const mod = findModule(sectionName);
    if (!mod) {
      if (sectionName.startsWith("custom.")) {
        const customMod = findModule("custom");
        if (customMod) {
          const md = new vscode.MarkdownString();
          md.appendMarkdown(`### Custom Module: \`${sectionName}\`\n\n`);
          md.appendMarkdown(`${customMod.description}\n\n`);
          md.appendMarkdown(
            `**Available variables:** ${customMod.formatVariables.map((v) => `\`$${v}\``).join(", ")}\n\n`,
          );
          md.appendMarkdown(`[Documentation](${customMod.docUrl})`);
          return new vscode.Hover(md);
        }
      }
      return undefined;
    }

    const md = new vscode.MarkdownString();
    md.appendMarkdown(`### Starship Module: \`${mod.name}\`\n\n`);
    md.appendMarkdown(`${mod.description}\n\n`);
    if (mod.formatVariables.length > 0) {
      md.appendMarkdown(
        `**Format variables:** ${mod.formatVariables.map((v) => `\`$${v}\``).join(", ")}\n\n`,
      );
    }
    md.appendMarkdown(`[Documentation](${mod.docUrl})`);

    return new vscode.Hover(md);
  }

  private hoverKey(
    lineText: string,
    position: vscode.Position,
    section: string,
  ): vscode.Hover | undefined {
    const keyMatch = lineText.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
    if (!keyMatch) return undefined;

    const key = keyMatch[1];

    // Check that the cursor is actually over the key
    const keyStart = lineText.indexOf(key);
    const keyEnd = keyStart + key.length;
    if (position.character < keyStart || position.character > keyEnd) {
      return undefined;
    }

    // Look up the option in the appropriate module or top-level
    if (section === "") {
      const opt = topLevelOptions.find((o) => o.name === key);
      if (opt) {
        return this.buildOptionHover(key, opt.type, opt.default, opt.description, opt.docUrl);
      }
    } else {
      const mod = findModule(section);
      if (mod) {
        const opt = mod.options.find((o) => o.name === key);
        if (opt) {
          return this.buildOptionHover(
            key,
            opt.type,
            opt.default,
            opt.description,
            mod.docUrl,
          );
        }
      }
    }

    return undefined;
  }

  private buildOptionHover(
    name: string,
    type: string,
    defaultValue: string,
    description: string,
    docUrl: string,
  ): vscode.Hover {
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**\`${name}\`** : \`${type}\`\n\n`);
    md.appendMarkdown(`${description}\n\n`);
    md.appendMarkdown(`**Default:** \`${defaultValue}\`\n\n`);
    md.appendMarkdown(`[Documentation](${docUrl})`);
    return new vscode.Hover(md);
  }
}
