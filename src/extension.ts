import * as vscode from "vscode";
import { StarshipCompletionProvider } from "./providers/completionProvider";
import { StarshipHoverProvider } from "./providers/hoverProvider";
import { StarshipDiagnosticProvider } from "./providers/diagnosticProvider";

const TOML_SELECTOR: vscode.DocumentSelector = {
  language: "toml",
  pattern: "**/starship.toml",
};

export function activate(context: vscode.ExtensionContext): void {
  // Register completion provider
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      TOML_SELECTOR,
      new StarshipCompletionProvider(),
      "[", // trigger on section header
      ".", // trigger for custom.* modules
      '"', // trigger inside strings
      "'", // trigger inside strings
      "$", // trigger for format variables
      " ", // trigger for style tokens
    ),
  );

  // Register hover provider
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      TOML_SELECTOR,
      new StarshipHoverProvider(),
    ),
  );

  // Register diagnostics
  const diagnosticProvider = new StarshipDiagnosticProvider();
  context.subscriptions.push(diagnosticProvider);

  // Log activation
  const outputChannel = vscode.window.createOutputChannel("Starship Toolkit");
  outputChannel.appendLine("Starship Toolkit activated");
  context.subscriptions.push(outputChannel);
}

export function deactivate(): void {
  // cleanup handled by disposables
}
