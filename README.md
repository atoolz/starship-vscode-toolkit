<p align="center">
  <img src="assets/icon.svg" alt="Starship Toolkit" width="128" height="128">
</p>

<h1 align="center">Starship Toolkit</h1>

<p align="center">
  <strong>Complete IntelliSense, validation, and documentation for <code>starship.toml</code> configuration</strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=andreahlert.starship-vscode-toolkit">
    <img src="https://img.shields.io/visual-studio-marketplace/v/andreahlert.starship-vscode-toolkit?style=flat-square&color=%23f97316&label=VS%20Code%20Marketplace" alt="VS Code Marketplace">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=andreahlert.starship-vscode-toolkit">
    <img src="https://img.shields.io/visual-studio-marketplace/i/andreahlert.starship-vscode-toolkit?style=flat-square&color=%23f97316" alt="Installs">
  </a>
  <a href="https://github.com/andreahlert/starship-vscode-toolkit/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/andreahlert/starship-vscode-toolkit?style=flat-square&color=%23f97316" alt="License">
  </a>
  <a href="https://starship.rs">
    <img src="https://img.shields.io/badge/starship-v1.x-f97316?style=flat-square" alt="Starship">
  </a>
</p>

---

[Starship](https://starship.rs) is the minimal, blazing-fast, and infinitely customizable prompt for any shell. This extension brings first-class editing support for `starship.toml` configuration files directly into VS Code.

## Features

### IntelliSense Completions

Full autocompletion for all ~70 Starship modules, their options, style strings, and format variables.

- **Section headers** - Autocomplete `[module_name]` with all known modules
- **Module options** - Context-aware option completion with types and defaults
- **Style strings** - Complete modifiers (`bold`, `italic`, `dimmed`) and colors (`red`, `fg:#hex`, `bg:blue`)
- **Format variables** - Suggest `$symbol`, `$version`, `$branch`, etc. based on the current module

![Completion Demo](assets/demo-completion.gif)

### Hover Documentation

Hover over any module name or option to see its description, type, default value, and a direct link to the Starship documentation.

![Hover Demo](assets/demo-hover.gif)

### Diagnostics and Validation

Real-time validation catches configuration errors as you type:

- Unknown module sections
- Unknown options within modules
- Invalid style strings
- Type mismatches (string where boolean expected, etc.)

![Diagnostics Demo](assets/demo-diagnostics.gif)

### Snippets

Quick-start templates for common configurations:

| Prefix | Description |
|---|---|
| `starship-starter` | Full starter config with character, directory, git |
| `starship-git` | Complete git setup (branch, commit, status, metrics) |
| `starship-node` | Node.js module configuration |
| `starship-python` | Python module with virtualenv support |
| `starship-rust` | Rust module configuration |
| `starship-docker` | Docker context module |
| `starship-kubernetes` | Kubernetes module |
| `starship-aws` | AWS module |
| `starship-time` | Time module |
| `starship-custom` | Custom module template |

## Supported Modules

All ~70 official Starship modules are supported with full option definitions, including:

`aws` `azure` `battery` `buf` `bun` `c` `character` `cmake` `cmd_duration` `cobol` `conda` `container` `crystal` `daml` `dart` `deno` `directory` `direnv` `docker_context` `dotnet` `elixir` `elm` `env_var` `erlang` `fennel` `fill` `fossil_branch` `fossil_metrics` `gcloud` `git_branch` `git_commit` `git_metrics` `git_state` `git_status` `gleam` `golang` `gradle` `guix_shell` `haskell` `haxe` `helm` `hostname` `java` `jobs` `julia` `kotlin` `kubernetes` `line_break` `localip` `lua` `memory_usage` `meson` `hg_branch` `mojo` `nats` `nim` `nix_shell` `nodejs` `ocaml` `odin` `opa` `openstack` `os` `package` `perl` `php` `pijul_channel` `pulumi` `purescript` `python` `quarto` `rlang` `raku` `red` `ruby` `rust` `scala` `shell` `shlvl` `singularity` `solidity` `spack` `status` `sudo` `swift` `terraform` `time` `typst` `username` `vagrant` `vcsh` `vlang` `zig` `custom.*`

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for **Starship Toolkit**
4. Click **Install**

Or install from the command line:

```bash
code --install-extension andreahlert.starship-vscode-toolkit
```

## Requirements

- VS Code 1.85.0 or higher
- A TOML language extension (e.g., [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml)) for syntax highlighting

The extension activates automatically when you open a file named `starship.toml`.

## Configuration

No additional configuration needed. The extension works out of the box for any file named `starship.toml`.

## Contributing

Contributions are welcome. Please open an issue or pull request on [GitHub](https://github.com/andreahlert/starship-vscode-toolkit).

## License

[MIT](LICENSE)
