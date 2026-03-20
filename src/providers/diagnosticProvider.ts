import * as vscode from "vscode";
import {
  isStarshipToml,
  parseSections,
  parseSectionOptions,
  extractStringValue,
} from "../utils/tomlParser";
import { findModule, allModuleNames } from "../data/modules";
import { topLevelOptions } from "../data/topLevel";
import { validateStyleString } from "../data/styles";

const DIAGNOSTIC_SOURCE = "Starship Toolkit";

export class StarshipDiagnosticProvider implements vscode.Disposable {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("starship");

    // Validate on open and change
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument((doc) => this.validate(doc)),
      vscode.workspace.onDidChangeTextDocument((e) =>
        this.validate(e.document),
      ),
      vscode.workspace.onDidCloseTextDocument((doc) =>
        this.diagnosticCollection.delete(doc.uri),
      ),
    );

    // Validate all open documents
    for (const doc of vscode.workspace.textDocuments) {
      this.validate(doc);
    }
  }

  validate(document: vscode.TextDocument): void {
    if (!isStarshipToml(document)) {
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const sections = parseSections(document);

    // Validate top-level options (lines before the first section)
    const firstSectionLine =
      sections.length > 0 ? sections[0].line : document.lineCount;
    this.validateTopLevel(document, 0, firstSectionLine, diagnostics);

    // Validate each section
    for (const section of sections) {
      this.validateSection(document, section, diagnostics);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  private validateTopLevel(
    document: vscode.TextDocument,
    startLine: number,
    endLine: number,
    diagnostics: vscode.Diagnostic[],
  ): void {
    const knownKeys = topLevelOptions.map((o) => o.name);
    // Also allow "palettes" sub-tables defined inline
    const extraAllowed = new Set(["palettes"]);

    for (let i = startLine; i < endLine && i < document.lineCount; i++) {
      const line = document.lineAt(i).text.trim();
      if (line === "" || line.startsWith("#")) continue;

      const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
      if (keyMatch) {
        const key = keyMatch[1];
        if (!knownKeys.includes(key) && !extraAllowed.has(key)) {
          const range = new vscode.Range(
            i,
            0,
            i,
            keyMatch[0].length - 1,
          );
          diagnostics.push(
            this.createDiagnostic(
              range,
              `Unknown top-level option: "${key}"`,
              vscode.DiagnosticSeverity.Warning,
            ),
          );
        } else {
          // Type check the value
          const opt = topLevelOptions.find((o) => o.name === key);
          if (opt) {
            this.validateValueType(
              document,
              i,
              key,
              line.substring(line.indexOf("=") + 1).trim(),
              opt.type,
              diagnostics,
            );
          }
        }
      }
    }
  }

  private validateSection(
    document: vscode.TextDocument,
    section: { name: string; line: number; endLine: number },
    diagnostics: vscode.Diagnostic[],
  ): void {
    const sectionName = section.name;

    // Check if section is a known module
    const isCustom = sectionName.startsWith("custom.");
    const isKnown =
      isCustom ||
      allModuleNames.includes(sectionName) ||
      sectionName === "palettes" ||
      sectionName.startsWith("palettes.");

    if (!isKnown) {
      const headerLine = document.lineAt(section.line).text;
      const bracketStart = headerLine.indexOf("[");
      const bracketEnd = headerLine.indexOf("]");
      const range = new vscode.Range(
        section.line,
        bracketStart,
        section.line,
        bracketEnd + 1,
      );
      diagnostics.push(
        this.createDiagnostic(
          range,
          `Unknown Starship module: "${sectionName}"`,
          vscode.DiagnosticSeverity.Warning,
        ),
      );
      return;
    }

    // Skip validation for palettes sections
    if (sectionName === "palettes" || sectionName.startsWith("palettes.")) {
      return;
    }

    const mod = findModule(sectionName);
    if (!mod) return;

    const options = parseSectionOptions(document, section.line, section.endLine);

    for (const opt of options) {
      const knownOption = mod.options.find((o) => o.name === opt.key);
      if (!knownOption) {
        const line = document.lineAt(opt.line).text;
        const keyStart = line.indexOf(opt.key);
        const range = new vscode.Range(
          opt.line,
          keyStart,
          opt.line,
          keyStart + opt.key.length,
        );
        diagnostics.push(
          this.createDiagnostic(
            range,
            `Unknown option "${opt.key}" in [${sectionName}]`,
            vscode.DiagnosticSeverity.Warning,
          ),
        );
        continue;
      }

      // Type checking
      this.validateValueType(
        document,
        opt.line,
        opt.key,
        opt.value,
        knownOption.type,
        diagnostics,
      );

      // Style validation
      if (
        (opt.key === "style" || opt.key.endsWith("_style")) &&
        knownOption.type === "string"
      ) {
        const strVal = extractStringValue(opt.value);
        if (strVal !== null && strVal.length > 0) {
          const error = validateStyleString(strVal);
          if (error) {
            const line = document.lineAt(opt.line).text;
            const valStart = line.indexOf(opt.value);
            const range = new vscode.Range(
              opt.line,
              valStart,
              opt.line,
              valStart + opt.value.length,
            );
            diagnostics.push(
              this.createDiagnostic(
                range,
                `Invalid style: ${error}`,
                vscode.DiagnosticSeverity.Error,
              ),
            );
          }
        }
      }
    }
  }

  private validateValueType(
    document: vscode.TextDocument,
    line: number,
    key: string,
    value: string,
    expectedType: string,
    diagnostics: vscode.Diagnostic[],
  ): void {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed.startsWith("#")) return;

    let actualType: string | null = null;

    if (trimmed === "true" || trimmed === "false") {
      actualType = "boolean";
    } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      actualType = "number";
    } else if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"""') || trimmed.startsWith("'''"))
    ) {
      actualType = "string";
    } else if (trimmed.startsWith("[")) {
      actualType = "array";
    } else if (trimmed.startsWith("{")) {
      actualType = "object";
    }

    if (actualType === null) return;

    // Check type mismatch
    const isCompatible =
      actualType === expectedType ||
      (expectedType === "object" && actualType === "array") ||
      (expectedType === "array" && actualType === "object");

    if (!isCompatible) {
      const lineText = document.lineAt(line).text;
      const valStart = lineText.indexOf(value);
      if (valStart < 0) return;
      const range = new vscode.Range(
        line,
        valStart,
        line,
        valStart + value.length,
      );
      diagnostics.push(
        this.createDiagnostic(
          range,
          `Type mismatch for "${key}": expected ${expectedType}, got ${actualType}`,
          vscode.DiagnosticSeverity.Error,
        ),
      );
    }
  }

  private createDiagnostic(
    range: vscode.Range,
    message: string,
    severity: vscode.DiagnosticSeverity,
  ): vscode.Diagnostic {
    const diagnostic = new vscode.Diagnostic(range, message, severity);
    diagnostic.source = DIAGNOSTIC_SOURCE;
    return diagnostic;
  }

  dispose(): void {
    this.diagnosticCollection.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}
