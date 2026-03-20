export interface ModuleOption {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  default: string;
  description: string;
}

export interface StarshipModule {
  name: string;
  description: string;
  docUrl: string;
  formatVariables: string[];
  options: ModuleOption[];
}

// Common options shared by most language/tool modules
const commonDetectOptions: ModuleOption[] = [
  { name: "detect_extensions", type: "array", default: "[]", description: "Which extensions should trigger this module." },
  { name: "detect_files", type: "array", default: "[]", description: "Which filenames should trigger this module." },
  { name: "detect_folders", type: "array", default: "[]", description: "Which folders should trigger this module." },
];

const commonFormatOptions: ModuleOption[] = [
  { name: "format", type: "string", default: '"[$symbol($version )]($style)"', description: "The format string for the module." },
  { name: "version_format", type: "string", default: '"v${raw}"', description: "The version format. Available vars are raw, major, minor, patch." },
  { name: "symbol", type: "string", default: '""', description: "Symbol displayed before the version string." },
  { name: "style", type: "string", default: '""', description: "The style for the module." },
  { name: "disabled", type: "boolean", default: "false", description: "Disables this module." },
];

function langModule(
  name: string,
  description: string,
  symbol: string,
  symbolDefault: string,
  styleDefault: string,
  detectExt: string,
  detectFiles: string,
  detectFolders: string,
  extraOptions: ModuleOption[] = [],
  extraVars: string[] = [],
): StarshipModule {
  return {
    name,
    description,
    docUrl: `https://starship.rs/config/#${name}`,
    formatVariables: ["symbol", "version", "style", ...extraVars],
    options: [
      { name: "format", type: "string", default: '"[$symbol($version )]($style)"', description: "The format string for the module." },
      { name: "version_format", type: "string", default: '"v${raw}"', description: "The version format." },
      { name: "symbol", type: "string", default: `"${symbolDefault}"`, description: `Symbol displayed before the ${name} version.` },
      { name: "style", type: "string", default: `"${styleDefault}"`, description: `The style for the ${name} module.` },
      { name: "disabled", type: "boolean", default: "false", description: `Disables the ${name} module.` },
      { name: "detect_extensions", type: "array", default: detectExt, description: "Which extensions trigger this module." },
      { name: "detect_files", type: "array", default: detectFiles, description: "Which filenames trigger this module." },
      { name: "detect_folders", type: "array", default: detectFolders, description: "Which folders trigger this module." },
      ...extraOptions,
    ],
  };
}

export const starshipModules: StarshipModule[] = [
  // ── aws ──
  {
    name: "aws",
    description: "Shows the current AWS region and profile. Based on AWS_REGION, AWS_DEFAULT_REGION, and AWS_PROFILE env vars.",
    docUrl: "https://starship.rs/config/#aws",
    formatVariables: ["symbol", "profile", "region", "duration", "style"],
    options: [
      { name: "format", type: "string", default: '"on [$symbol($profile )(\\($region\\) )(\\[$duration\\] )]($style)"', description: "The format string for the module." },
      { name: "symbol", type: "string", default: '"☁️  "', description: "Symbol displayed before the AWS profile." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the aws module." },
      { name: "region_aliases", type: "object", default: "{}", description: "Table of region aliases to display in addition to the AWS name." },
      { name: "profile_aliases", type: "object", default: "{}", description: "Table of profile aliases to display in addition to the AWS name." },
      { name: "expiration_symbol", type: "string", default: '"X"', description: "Symbol displayed when credentials are expired." },
      { name: "force_display", type: "boolean", default: "false", description: "If true, displays info even without credentials file or env vars." },
    ],
  },

  // ── azure ──
  {
    name: "azure",
    description: "Shows the current Azure subscription. Based on azure CLI.",
    docUrl: "https://starship.rs/config/#azure",
    formatVariables: ["symbol", "subscription", "username", "style"],
    options: [
      { name: "format", type: "string", default: '"on [$symbol($subscription)]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"ﴃ "', description: "Symbol displayed before the subscription." },
      { name: "style", type: "string", default: '"blue bold"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the azure module." },
      { name: "subscription_aliases", type: "object", default: "{}", description: "Table of subscription name aliases." },
    ],
  },

  // ── battery ──
  {
    name: "battery",
    description: "Shows the battery charge level and charging status.",
    docUrl: "https://starship.rs/config/#battery",
    formatVariables: ["symbol", "percentage", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol$percentage]($style) "', description: "The format string." },
      { name: "full_symbol", type: "string", default: '"󰁹 "', description: "Symbol when battery is full." },
      { name: "charging_symbol", type: "string", default: '"󰂄 "', description: "Symbol when battery is charging." },
      { name: "discharging_symbol", type: "string", default: '"󰂃 "', description: "Symbol when battery is discharging." },
      { name: "unknown_symbol", type: "string", default: '"󰁽 "', description: "Symbol when battery status is unknown." },
      { name: "empty_symbol", type: "string", default: '"󰂎 "', description: "Symbol when battery is empty." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the battery module." },
      { name: "display", type: "object", default: "[]", description: "Display threshold and style configuration." },
    ],
  },

  // ── buf ──
  langModule("buf", "Shows the currently installed version of Buf.", "buf", " ", "bold blue", '["buf"]', '["buf.yaml", "buf.gen.yaml", "buf.work.yaml"]', "[]"),

  // ── bun ──
  langModule("bun", "Shows the currently installed version of Bun.", "bun", "🍞 ", "bold red", '["bun"]', '["bun.lockb", "bunfig.toml"]', "[]"),

  // ── c ──
  langModule("c", "Shows the C compiler version.", "c", "C ", "bold 149", '["c", "h"]', "[]", "[]", [
    { name: "commands", type: "array", default: '[["cc", "--version"], ["gcc", "--version"], ["clang", "--version"]]', description: "How to detect the C compiler version." },
  ]),

  // ── character ──
  {
    name: "character",
    description: "Shows a character beside where the text is entered in the terminal, indicating last command status.",
    docUrl: "https://starship.rs/config/#character",
    formatVariables: ["symbol"],
    options: [
      { name: "format", type: "string", default: '"$symbol "', description: "The format string." },
      { name: "success_symbol", type: "string", default: '"[❯](bold green)"', description: "Symbol shown before input if previous command succeeded." },
      { name: "error_symbol", type: "string", default: '"[❯](bold red)"', description: "Symbol shown before input if previous command failed." },
      { name: "vimcmd_symbol", type: "string", default: '"[❮](bold green)"', description: "Symbol shown before input in vim normal mode." },
      { name: "vimcmd_replace_one_symbol", type: "string", default: '"[❮](bold purple)"', description: "Symbol in vim replace_one mode." },
      { name: "vimcmd_replace_symbol", type: "string", default: '"[❮](bold purple)"', description: "Symbol in vim replace mode." },
      { name: "vimcmd_visual_symbol", type: "string", default: '"[❮](bold yellow)"', description: "Symbol in vim visual mode." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the character module." },
    ],
  },

  // ── cmake ──
  langModule("cmake", "Shows the currently installed version of CMake.", "cmake", "△ ", "bold blue", "[]", '["CMakeLists.txt", "CMakeCache.txt"]', "[]"),

  // ── cmd_duration ──
  {
    name: "cmd_duration",
    description: "Shows how long the last command took to execute.",
    docUrl: "https://starship.rs/config/#command-duration",
    formatVariables: ["duration", "style"],
    options: [
      { name: "min_time", type: "number", default: "2000", description: "Shortest duration to show time for (in milliseconds)." },
      { name: "format", type: "string", default: '"took [$duration]($style) "', description: "The format string." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "show_milliseconds", type: "boolean", default: "false", description: "Show milliseconds in addition to seconds." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the cmd_duration module." },
      { name: "show_notifications", type: "boolean", default: "false", description: "Show desktop notifications when command completes." },
      { name: "min_time_to_notify", type: "number", default: "45000", description: "Shortest duration for notification (in milliseconds)." },
      { name: "notification_timeout", type: "number", default: "0", description: "Duration to show notification for (0 = no timeout)." },
    ],
  },

  // ── cobol ──
  langModule("cobol", "Shows the currently installed version of COBOL.", "cobol", "⚙️ ", "bold blue", '["cbl", "cob", "CBL", "COB"]', "[]", "[]"),

  // ── conda ──
  {
    name: "conda",
    description: "Shows the current Conda environment if $CONDA_DEFAULT_ENV is set.",
    docUrl: "https://starship.rs/config/#conda",
    formatVariables: ["symbol", "environment", "style"],
    options: [
      { name: "format", type: "string", default: '"via [$symbol$environment]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"🅒 "', description: "Symbol displayed before the environment name." },
      { name: "style", type: "string", default: '"bold green"', description: "The style for the module." },
      { name: "ignore_base", type: "boolean", default: "true", description: 'Ignores the base environment when activated.' },
      { name: "truncation_length", type: "number", default: "1", description: "Number of directories the environment path should be truncated to." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the conda module." },
    ],
  },

  // ── container ──
  {
    name: "container",
    description: "Shows a symbol if inside a container (Docker, Podman, etc.).",
    docUrl: "https://starship.rs/config/#container",
    formatVariables: ["symbol", "name", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol \\[$name\\]]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"⬡"', description: "Symbol displayed if inside a container." },
      { name: "style", type: "string", default: '"bold red dimmed"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the container module." },
    ],
  },

  // ── crystal ──
  langModule("crystal", "Shows the currently installed version of Crystal.", "crystal", "🔮 ", "bold red", '["cr"]', '["shard.yml"]', "[]"),

  // ── daml ──
  langModule("daml", "Shows the Daml SDK version.", "daml", "Λ ", "bold cyan", "[]", '["daml.yaml"]', "[]"),

  // ── dart ──
  langModule("dart", "Shows the currently installed version of Dart.", "dart", "🎯 ", "bold blue", '["dart"]', '["pubspec.yaml", "pubspec.yml", "pubspec.lock"]', '["dart_tool"]'),

  // ── deno ──
  langModule("deno", "Shows the currently installed version of Deno.", "deno", "🦕 ", "green bold", '["ts", "js"]', '["deno.json", "deno.jsonc", "mod.ts", "deps.ts", "mod.js", "deps.js"]', "[]"),

  // ── directory ──
  {
    name: "directory",
    description: "Shows the path to your current directory, truncated to three parent folders.",
    docUrl: "https://starship.rs/config/#directory",
    formatVariables: ["path", "style", "read_only"],
    options: [
      { name: "format", type: "string", default: '"[$path]($style)[$read_only]($read_only_style) "', description: "The format string." },
      { name: "style", type: "string", default: '"bold cyan"', description: "The style for the module." },
      { name: "truncation_length", type: "number", default: "3", description: "Number of parent folders to truncate to." },
      { name: "truncate_to_repo", type: "boolean", default: "true", description: "Whether to truncate to the root of the git repo." },
      { name: "truncation_symbol", type: "string", default: '""', description: "Symbol to prefix truncated paths." },
      { name: "home_symbol", type: "string", default: '"~"', description: "Symbol indicating home directory." },
      { name: "read_only", type: "string", default: '"🔒"', description: "Symbol indicating current directory is read only." },
      { name: "read_only_style", type: "string", default: '"red"', description: "Style for the read only symbol." },
      { name: "repo_root_style", type: "string", default: '""', description: "Style for the git repo root directory." },
      { name: "repo_root_format", type: "string", default: '""', description: "Format for git repo root. Overrides format when in a repo." },
      { name: "before_repo_root_style", type: "string", default: '""', description: "Style for path before the repo root." },
      { name: "use_logical_path", type: "boolean", default: "true", description: "Displays the logical path from the shell instead of the OS path." },
      { name: "fish_style_pwd_dir_length", type: "number", default: "0", description: "Fish shell style pwd directory length." },
      { name: "use_os_file_sep", type: "boolean", default: "true", description: "Use the OS-specific file separator instead of /." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the directory module." },
    ],
  },

  // ── direnv ──
  {
    name: "direnv",
    description: "Shows the status of the current direnv rc file.",
    docUrl: "https://starship.rs/config/#direnv",
    formatVariables: ["symbol", "rc_path", "allowed", "denied", "loaded", "not_allowed", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol$loaded/$allowed]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"direnv "', description: "Symbol displayed before direnv info." },
      { name: "style", type: "string", default: '"bold orange"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the direnv module." },
      { name: "detect_extensions", type: "array", default: "[]", description: "Which extensions trigger this module." },
      { name: "detect_files", type: "array", default: '[".envrc"]', description: "Which filenames trigger this module." },
      { name: "detect_folders", type: "array", default: "[]", description: "Which folders trigger this module." },
      { name: "allowed_msg", type: "string", default: '"allowed"', description: "Message displayed when an envrc is allowed." },
      { name: "not_allowed_msg", type: "string", default: '"not allowed"', description: "Message displayed when an envrc is not allowed." },
      { name: "denied_msg", type: "string", default: '"denied"', description: "Message displayed when an envrc is denied." },
      { name: "loaded_msg", type: "string", default: '"loaded"', description: "Message displayed when an envrc is loaded." },
      { name: "unloaded_msg", type: "string", default: '"not loaded"', description: "Message displayed when an envrc is not loaded." },
    ],
  },

  // ── docker_context ──
  {
    name: "docker_context",
    description: "Shows the currently active Docker context if not set to default.",
    docUrl: "https://starship.rs/config/#docker-context",
    formatVariables: ["symbol", "context", "style"],
    options: [
      { name: "format", type: "string", default: '"via [$symbol$context]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"🐳 "', description: "Symbol displayed before the Docker context." },
      { name: "style", type: "string", default: '"blue bold"', description: "The style for the module." },
      { name: "only_with_files", type: "boolean", default: "true", description: "Only show when there are Docker-related files." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the docker_context module." },
      { name: "detect_extensions", type: "array", default: "[]", description: "Which extensions trigger this module." },
      { name: "detect_files", type: "array", default: '["docker-compose.yml", "docker-compose.yaml", "Dockerfile"]', description: "Which filenames trigger this module." },
      { name: "detect_folders", type: "array", default: "[]", description: "Which folders trigger this module." },
    ],
  },

  // ── dotnet ──
  langModule("dotnet", "Shows the relevant version of the .NET SDK.", "dotnet", ".NET ", "bold blue", '["csproj", "fsproj", "xproj"]', '["global.json", "project.json", "Directory.Build.props", "Directory.Build.targets", "Packages.props"]', "[]", [
    { name: "heuristic", type: "boolean", default: "true", description: "Use heuristic version detection to speed up the module." },
  ], ["tfm"]),

  // ── elixir ──
  langModule("elixir", "Shows the currently installed version of Elixir and Erlang/OTP.", "elixir", "💧 ", "bold purple", '["ex", "exs"]', '["mix.exs"]', "[]", [], ["otp_version"]),

  // ── elm ──
  langModule("elm", "Shows the currently installed version of Elm.", "elm", "🌳 ", "bold cyan", '["elm"]', '["elm.json", "elm-package.json", ".elm-version"]', '["elm-stuff"]'),

  // ── env_var ──
  {
    name: "env_var",
    description: "Shows the current value of a selected environment variable.",
    docUrl: "https://starship.rs/config/#environment-variable",
    formatVariables: ["env_value", "symbol", "style"],
    options: [
      { name: "symbol", type: "string", default: '""', description: "Symbol displayed before the variable value." },
      { name: "variable", type: "string", default: '""', description: "The environment variable to be displayed." },
      { name: "default", type: "string", default: '""', description: "Default value to show when the variable is not defined." },
      { name: "format", type: "string", default: '"with [$env_value]($style) "', description: "The format string." },
      { name: "style", type: "string", default: '"black bold dimmed"', description: "The style for the module." },
      { name: "description", type: "string", default: '""', description: "A short description of the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the env_var module." },
    ],
  },

  // ── erlang ──
  langModule("erlang", "Shows the currently installed version of Erlang/OTP.", "erlang", " ", "bold red", "[]", '["rebar.config", "erlang.mk"]', "[]"),

  // ── fennel ──
  langModule("fennel", "Shows the currently installed version of Fennel.", "fennel", "🧅 ", "bold green", '["fnl"]', "[]", "[]"),

  // ── fill ──
  {
    name: "fill",
    description: "Fills the remaining space on the line with a character.",
    docUrl: "https://starship.rs/config/#fill",
    formatVariables: [],
    options: [
      { name: "symbol", type: "string", default: '"."', description: "The symbol used to fill the line." },
      { name: "style", type: "string", default: '"bold black"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the fill module." },
    ],
  },

  // ── fossil_branch ──
  {
    name: "fossil_branch",
    description: "Shows the name of the active branch of the Fossil checkout.",
    docUrl: "https://starship.rs/config/#fossil-branch",
    formatVariables: ["symbol", "branch", "style"],
    options: [
      { name: "format", type: "string", default: '"on [$symbol$branch]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '" "', description: "Symbol displayed before the branch name." },
      { name: "style", type: "string", default: '"bold purple"', description: "The style for the module." },
      { name: "truncation_length", type: "number", default: "9223372036854775807", description: "Truncate a Fossil branch name to N characters." },
      { name: "truncation_symbol", type: "string", default: '"…"', description: "Symbol appended to a truncated branch name." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the fossil_branch module." },
    ],
  },

  // ── fossil_metrics ──
  {
    name: "fossil_metrics",
    description: "Shows the number of added and deleted lines in a Fossil checkout.",
    docUrl: "https://starship.rs/config/#fossil-metrics",
    formatVariables: ["added", "deleted", "style"],
    options: [
      { name: "format", type: "string", default: '"([+$added]($added_style) )([-$deleted]($deleted_style) )"', description: "The format string." },
      { name: "added_style", type: "string", default: '"bold green"', description: "Style for the added count." },
      { name: "deleted_style", type: "string", default: '"bold red"', description: "Style for the deleted count." },
      { name: "only_nonzero_diffs", type: "boolean", default: "true", description: "Render only for changed files." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the fossil_metrics module." },
    ],
  },

  // ── gcloud ──
  {
    name: "gcloud",
    description: "Shows the current GCloud configuration (account, project, region).",
    docUrl: "https://starship.rs/config/#google-cloud-gcloud",
    formatVariables: ["symbol", "account", "domain", "project", "region", "active", "style"],
    options: [
      { name: "format", type: "string", default: '"on [$symbol$account(@$domain)(\\($region\\))]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"☁️  "', description: "Symbol displayed before the current GCloud profile." },
      { name: "style", type: "string", default: '"bold blue"', description: "The style for the module." },
      { name: "region_aliases", type: "object", default: "{}", description: "Table of region aliases." },
      { name: "project_aliases", type: "object", default: "{}", description: "Table of project aliases." },
      { name: "detect_env_vars", type: "array", default: "[]", description: "Which environment variables trigger display." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the gcloud module." },
    ],
  },

  // ── git_branch ──
  {
    name: "git_branch",
    description: "Shows the active branch of the repo in your current directory.",
    docUrl: "https://starship.rs/config/#git-branch",
    formatVariables: ["symbol", "branch", "remote_name", "remote_branch", "style"],
    options: [
      { name: "format", type: "string", default: '"on [$symbol$branch(:$remote_branch)]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '" "', description: "Symbol before the branch name." },
      { name: "style", type: "string", default: '"bold purple"', description: "The style for the module." },
      { name: "truncation_length", type: "number", default: "9223372036854775807", description: "Truncate branch name to N characters." },
      { name: "truncation_symbol", type: "string", default: '"…"', description: "Symbol appended to a truncated branch name." },
      { name: "only_attached", type: "boolean", default: "false", description: "Only show branch name when not in detached HEAD state." },
      { name: "always_show_remote", type: "boolean", default: "false", description: "Always show the remote tracking branch name." },
      { name: "ignore_branches", type: "array", default: "[]", description: "A list of branch names to not display." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the git_branch module." },
    ],
  },

  // ── git_commit ──
  {
    name: "git_commit",
    description: "Shows the current commit hash and tag of the repo.",
    docUrl: "https://starship.rs/config/#git-commit",
    formatVariables: ["hash", "tag", "style"],
    options: [
      { name: "format", type: "string", default: '"[\\($hash$tag\\)]($style) "', description: "The format string." },
      { name: "commit_hash_length", type: "number", default: "7", description: "Length of the displayed git commit hash." },
      { name: "style", type: "string", default: '"bold green"', description: "The style for the module." },
      { name: "only_detached", type: "boolean", default: "true", description: "Only show commit hash when in detached HEAD state." },
      { name: "tag_disabled", type: "boolean", default: "true", description: "Disables showing tag info." },
      { name: "tag_symbol", type: "string", default: '" 🏷 "', description: "Tag symbol prefixing the info." },
      { name: "tag_max_candidates", type: "number", default: "0", description: "Number of commits to check for nearest tag." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the git_commit module." },
    ],
  },

  // ── git_metrics ──
  {
    name: "git_metrics",
    description: "Shows the number of added and deleted lines in the current git repo.",
    docUrl: "https://starship.rs/config/#git-metrics",
    formatVariables: ["added", "deleted", "style"],
    options: [
      { name: "format", type: "string", default: '"([+$added]($added_style) )([-$deleted]($deleted_style) )"', description: "The format string." },
      { name: "added_style", type: "string", default: '"bold green"', description: "Style for the added count." },
      { name: "deleted_style", type: "string", default: '"bold red"', description: "Style for the deleted count." },
      { name: "only_nonzero_diffs", type: "boolean", default: "true", description: "Render only for changed files." },
      { name: "ignore_submodules", type: "boolean", default: "false", description: "Ignore changes to submodules." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the git_metrics module." },
    ],
  },

  // ── git_state ──
  {
    name: "git_state",
    description: "Shows the current git state (rebase, merge, cherry-pick, etc.).",
    docUrl: "https://starship.rs/config/#git-state",
    formatVariables: ["state", "progress_current", "progress_total", "style"],
    options: [
      { name: "format", type: "string", default: '"\\([$state( $progress_current/$progress_total)]($style)\\) "', description: "The format string." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "rebase", type: "string", default: '"REBASING"', description: "Text displayed during a rebase." },
      { name: "merge", type: "string", default: '"MERGING"', description: "Text displayed during a merge." },
      { name: "revert", type: "string", default: '"REVERTING"', description: "Text displayed during a revert." },
      { name: "cherry_pick", type: "string", default: '"CHERRY-PICKING"', description: "Text displayed during a cherry-pick." },
      { name: "bisect", type: "string", default: '"BISECTING"', description: "Text displayed during a bisect." },
      { name: "am", type: "string", default: '"AM"', description: "Text displayed during git am." },
      { name: "am_or_rebase", type: "string", default: '"AM/REBASE"', description: "Text displayed during git am or rebase." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the git_state module." },
    ],
  },

  // ── git_status ──
  {
    name: "git_status",
    description: "Shows symbols indicating the state of the repo in your current directory.",
    docUrl: "https://starship.rs/config/#git-status",
    formatVariables: ["all_status", "ahead_behind", "style"],
    options: [
      { name: "format", type: "string", default: '"([\\[$all_status$ahead_behind\\]]($style) )"', description: "The format string." },
      { name: "style", type: "string", default: '"bold red"', description: "The style for the module." },
      { name: "stashed", type: "string", default: '"\\$"', description: "Symbol for stashed changes." },
      { name: "ahead", type: "string", default: '"⇡"', description: "Format of ahead count." },
      { name: "behind", type: "string", default: '"⇣"', description: "Format of behind count." },
      { name: "up_to_date", type: "string", default: '""', description: "Format when branch is up to date." },
      { name: "diverged", type: "string", default: '"⇕"', description: "Format of diverged count." },
      { name: "conflicted", type: "string", default: '"="', description: "Format of conflicted count." },
      { name: "deleted", type: "string", default: '"✘"', description: "Format of deleted count." },
      { name: "renamed", type: "string", default: '"»"', description: "Format of renamed count." },
      { name: "modified", type: "string", default: '"!"', description: "Format of modified count." },
      { name: "staged", type: "string", default: '"+"', description: "Format of staged count." },
      { name: "untracked", type: "string", default: '"?"', description: "Format of untracked count." },
      { name: "typechanged", type: "string", default: '""', description: "Format of typechanged count." },
      { name: "ignore_submodules", type: "boolean", default: "false", description: "Ignore changes to submodules." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the git_status module." },
    ],
  },

  // ── gleam ──
  langModule("gleam", "Shows the currently installed version of Gleam.", "gleam", "⭐ ", "bold #ffaff3", '["gleam"]', '["gleam.toml"]', "[]"),

  // ── golang ──
  langModule("golang", "Shows the currently installed version of Go.", "golang", "🐹 ", "bold cyan", '["go"]', '["go.mod", "go.sum", "go.work", "glide.yaml", "Gopkg.yml", "Gopkg.lock", ".go-version"]', '["Godeps"]', [
    { name: "not_capable_style", type: "string", default: '"bold red"', description: "Style when Go version does not match go.mod." },
  ]),

  // ── gradle ──
  langModule("gradle", "Shows the version of the Gradle Wrapper.", "gradle", "🅶 ", "bold bright-cyan", '["gradle", "gradle.kts"]', "[]", '["gradle"]'),

  // ── guix_shell ──
  {
    name: "guix_shell",
    description: "Shows when in a Guix shell environment.",
    docUrl: "https://starship.rs/config/#guix-shell",
    formatVariables: ["symbol", "style"],
    options: [
      { name: "format", type: "string", default: '"via [$symbol]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"🐃 "', description: "Symbol displayed in Guix shell." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the guix_shell module." },
    ],
  },

  // ── haskell ──
  langModule("haskell", "Shows the currently used Haskell/GHC version.", "haskell", "λ ", "bold purple", '["hs"]', '["stack.yaml", "cabal.project"]', "[]"),

  // ── helm ──
  langModule("helm", "Shows the currently installed version of Helm.", "helm", "⎈ ", "bold white", '["helmfile"]', '["helmfile.yaml", "Chart.yaml"]', "[]"),

  // ── hostname ──
  {
    name: "hostname",
    description: "Shows the system hostname.",
    docUrl: "https://starship.rs/config/#hostname",
    formatVariables: ["hostname", "style", "ssh_symbol"],
    options: [
      { name: "format", type: "string", default: '"[$ssh_symbol$hostname]($style) in "', description: "The format string." },
      { name: "style", type: "string", default: '"bold dimmed green"', description: "The style for the module." },
      { name: "ssh_only", type: "boolean", default: "true", description: "Only show hostname when connected to an SSH session." },
      { name: "ssh_symbol", type: "string", default: '"🌐 "', description: "Symbol when connected via SSH." },
      { name: "trim_at", type: "string", default: '"."', description: "String the hostname is cut off at after the first match." },
      { name: "detect_env_vars", type: "array", default: "[]", description: "Which environment variables trigger display." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the hostname module." },
    ],
  },

  // ── java ──
  langModule("java", "Shows the currently installed version of Java.", "java", "☕ ", "bold red dimmed", '["java", "class", "gradle", "jar", "cljs", "cljc"]', '["pom.xml", "build.gradle.kts", "build.sbt", ".java-version", "deps.edn", "project.clj", "build.boot", ".sdkmanrc"]', "[]"),

  // ── jobs ──
  {
    name: "jobs",
    description: "Shows the current number of background jobs running.",
    docUrl: "https://starship.rs/config/#jobs",
    formatVariables: ["symbol", "number", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol$number]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"✦"', description: "Symbol displayed when there are jobs." },
      { name: "style", type: "string", default: '"bold blue"', description: "The style for the module." },
      { name: "number_threshold", type: "number", default: "1", description: "Show number of jobs if at least this many." },
      { name: "symbol_threshold", type: "number", default: "1", description: "Show the symbol if at least this many jobs." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the jobs module." },
    ],
  },

  // ── julia ──
  langModule("julia", "Shows the currently installed version of Julia.", "julia", "ஃ ", "bold purple", '["jl"]', '["Project.toml", "Manifest.toml"]', "[]"),

  // ── kotlin ──
  langModule("kotlin", "Shows the currently installed version of Kotlin.", "kotlin", "🅺 ", "bold blue", '["kt", "kts"]', "[]", "[]"),

  // ── kubernetes ──
  {
    name: "kubernetes",
    description: "Shows the current Kubernetes context name and namespace.",
    docUrl: "https://starship.rs/config/#kubernetes",
    formatVariables: ["symbol", "context", "namespace", "cluster", "user", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol$context( \\($namespace\\))]($style) in "', description: "The format string." },
      { name: "symbol", type: "string", default: '"☸ "', description: "Symbol displayed before the Kubernetes info." },
      { name: "style", type: "string", default: '"bold cyan"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the kubernetes module." },
      { name: "detect_extensions", type: "array", default: "[]", description: "Which extensions trigger this module." },
      { name: "detect_files", type: "array", default: "[]", description: "Which filenames trigger this module." },
      { name: "detect_folders", type: "array", default: "[]", description: "Which folders trigger this module." },
      { name: "detect_env_vars", type: "array", default: "[]", description: "Which env vars trigger this module." },
      { name: "contexts", type: "object", default: "[]", description: "Customized styles and symbols for specific contexts." },
      { name: "context_aliases", type: "object", default: "{}", description: "Table of context aliases." },
      { name: "user_aliases", type: "object", default: "{}", description: "Table of user aliases." },
    ],
  },

  // ── line_break ──
  {
    name: "line_break",
    description: "Separates the prompt into two lines.",
    docUrl: "https://starship.rs/config/#line-break",
    formatVariables: [],
    options: [
      { name: "disabled", type: "boolean", default: "false", description: "Disables the line_break module (single line prompt)." },
    ],
  },

  // ── localip ──
  {
    name: "localip",
    description: "Shows the local IP address.",
    docUrl: "https://starship.rs/config/#local-ip",
    formatVariables: ["localipv4", "localipv6", "style"],
    options: [
      { name: "format", type: "string", default: '"[$localipv4]($style) "', description: "The format string." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "ssh_only", type: "boolean", default: "true", description: "Only show IP address when connected to SSH." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the localip module." },
    ],
  },

  // ── lua ──
  langModule("lua", "Shows the currently installed version of Lua.", "lua", "🌙 ", "bold blue", '["lua"]', '["lua", ".lua-version"]', '["lua"]'),

  // ── memory_usage ──
  {
    name: "memory_usage",
    description: "Shows current system memory and swap usage.",
    docUrl: "https://starship.rs/config/#memory-usage",
    formatVariables: ["symbol", "ram", "ram_pct", "swap", "swap_pct", "style"],
    options: [
      { name: "format", type: "string", default: '"via $symbol[$ram( | $swap)]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"🐏 "', description: "Symbol displayed before the memory usage." },
      { name: "style", type: "string", default: '"bold dimmed white"', description: "The style for the module." },
      { name: "threshold", type: "number", default: "75", description: "Show memory usage if above this percentage." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the memory_usage module." },
    ],
  },

  // ── meson ──
  langModule("meson", "Shows the current Meson dev environment.", "meson", "⬡ ", "bold blue", "[]", '["meson.build"]', '["builddir"]'),

  // ── hg_branch ──
  {
    name: "hg_branch",
    description: "Shows the active branch and topic of the repo in your current directory.",
    docUrl: "https://starship.rs/config/#mercurial-branch",
    formatVariables: ["symbol", "branch", "topic", "style"],
    options: [
      { name: "format", type: "string", default: '"on [$symbol$branch(:$topic)]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '" "', description: "Symbol displayed before the branch name." },
      { name: "style", type: "string", default: '"bold purple"', description: "The style for the module." },
      { name: "truncation_length", type: "number", default: "9223372036854775807", description: "Truncate branch name to N characters." },
      { name: "truncation_symbol", type: "string", default: '"…"', description: "Symbol appended to a truncated branch name." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the hg_branch module." },
    ],
  },

  // ── nim ──
  langModule("nim", "Shows the currently installed version of Nim.", "nim", "👑 ", "bold yellow", '["nim", "nims", "nimble"]', '["nim.cfg"]', "[]"),

  // ── nix_shell ──
  {
    name: "nix_shell",
    description: "Shows when operating inside a nix-shell.",
    docUrl: "https://starship.rs/config/#nix-shell",
    formatVariables: ["symbol", "state", "name", "style"],
    options: [
      { name: "format", type: "string", default: '"via [$symbol$state( \\($name\\))]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"❄️  "', description: "Symbol displayed before the nix-shell." },
      { name: "style", type: "string", default: '"bold blue"', description: "The style for the module." },
      { name: "impure_msg", type: "string", default: '"impure"', description: "Message displayed for impure shells." },
      { name: "pure_msg", type: "string", default: '"pure"', description: "Message displayed for pure shells." },
      { name: "unknown_msg", type: "string", default: '""', description: "Message displayed when shell type is unknown." },
      { name: "heuristic", type: "boolean", default: "false", description: "Try to detect new-style nix-shell heuristically." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the nix_shell module." },
    ],
  },

  // ── nodejs ──
  {
    name: "nodejs",
    description: "Shows the currently installed version of Node.js.",
    docUrl: "https://starship.rs/config/#node-js",
    formatVariables: ["symbol", "version", "style", "engines_version"],
    options: [
      { name: "format", type: "string", default: '"via [$symbol($version )]($style)"', description: "The format string." },
      { name: "version_format", type: "string", default: '"v${raw}"', description: "The version format." },
      { name: "symbol", type: "string", default: '" "', description: "Symbol displayed before the Node.js version." },
      { name: "style", type: "string", default: '"bold green"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the nodejs module." },
      { name: "not_capable_style", type: "string", default: '"bold red"', description: "Style when Node version doesn't match engines in package.json." },
      { name: "detect_extensions", type: "array", default: '["js", "mjs", "cjs", "ts", "mts", "cts"]', description: "Which extensions trigger this module." },
      { name: "detect_files", type: "array", default: '["package.json", ".node-version", ".nvmrc"]', description: "Which filenames trigger this module." },
      { name: "detect_folders", type: "array", default: '["node_modules"]', description: "Which folders trigger this module." },
    ],
  },

  // ── ocaml ──
  langModule("ocaml", "Shows the currently installed version of OCaml.", "ocaml", "🐫 ", "bold yellow", '["ml", "mli", "re", "rei"]', '["dune", "dune-project", "jbuild", "jbuild-ignore", ".merlin"]', '["_opam", "esy.lock"]', [], ["switch_name", "switch_indicator"]),

  // ── odin ──
  langModule("odin", "Shows the currently installed version of Odin.", "odin", "Ø ", "bold bright-blue", '["odin"]', "[]", "[]"),

  // ── openstack ──
  {
    name: "openstack",
    description: "Shows the current OpenStack cloud and project.",
    docUrl: "https://starship.rs/config/#openstack",
    formatVariables: ["symbol", "cloud", "project", "style"],
    options: [
      { name: "format", type: "string", default: '"on [$symbol$cloud(\\($project\\))]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"☁️  "', description: "Symbol displayed before the OpenStack info." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the openstack module." },
    ],
  },

  // ── os ──
  {
    name: "os",
    description: "Shows the current operating system.",
    docUrl: "https://starship.rs/config/#os",
    formatVariables: ["symbol", "name", "type", "codename", "edition", "version", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol]($style)"', description: "The format string." },
      { name: "style", type: "string", default: '"bold white"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the os module." },
      { name: "symbols", type: "object", default: "{}", description: "A table mapping OS types to symbols." },
    ],
  },

  // ── package ──
  {
    name: "package",
    description: "Shows the version of the package in the current directory.",
    docUrl: "https://starship.rs/config/#package-version",
    formatVariables: ["symbol", "version", "style"],
    options: [
      { name: "format", type: "string", default: '"is [$symbol$version]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"📦 "', description: "Symbol displayed before the package version." },
      { name: "style", type: "string", default: '"bold 208"', description: "The style for the module." },
      { name: "display_private", type: "boolean", default: "false", description: "Enable displaying version for private packages." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the package module." },
      { name: "version_format", type: "string", default: '"v${raw}"', description: "The version format." },
    ],
  },

  // ── perl ──
  langModule("perl", "Shows the currently installed version of Perl.", "perl", "🐪 ", "bold 149", '["pl", "pm", "pod"]', '["Makefile.PL", "Build.PL", "cpanfile", "cpanfile.snapshot", "META.json", "META.yml", ".perl-version"]', "[]"),

  // ── php ──
  langModule("php", "Shows the currently installed version of PHP.", "php", "🐘 ", "bold 147", '["php"]', '["composer.json", ".php-version"]', "[]"),

  // ── pulumi ──
  {
    name: "pulumi",
    description: "Shows the current Pulumi stack name and version.",
    docUrl: "https://starship.rs/config/#pulumi",
    formatVariables: ["symbol", "version", "stack", "style"],
    options: [
      { name: "format", type: "string", default: '"via [$symbol($username@)$stack]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '" "', description: "Symbol displayed before the Pulumi info." },
      { name: "style", type: "string", default: '"bold 5"', description: "The style for the module." },
      { name: "search_upwards", type: "boolean", default: "true", description: "Search upward for Pulumi stack files." },
      { name: "version_format", type: "string", default: '"v${raw}"', description: "The version format." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the pulumi module." },
    ],
  },

  // ── purescript ──
  langModule("purescript", "Shows the currently installed version of PureScript.", "purescript", "<=> ", "bold white", '["purs"]', '["spago.dhall", "spago.yaml", "bower.json"]', "[]"),

  // ── python ──
  {
    name: "python",
    description: "Shows the currently installed version of Python and the active virtualenv.",
    docUrl: "https://starship.rs/config/#python",
    formatVariables: ["symbol", "version", "virtualenv", "pyenv_prefix", "style"],
    options: [
      { name: "format", type: "string", default: "'via [${symbol}${pyenv_prefix}(${version} )(\\($virtualenv\\) )]($style)'", description: "The format string." },
      { name: "version_format", type: "string", default: '"v${raw}"', description: "The version format." },
      { name: "symbol", type: "string", default: '"🐍 "', description: "Symbol displayed before the Python version." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "pyenv_version_name", type: "boolean", default: "false", description: "Use pyenv to get the Python version." },
      { name: "pyenv_prefix", type: "string", default: '"pyenv "', description: "Prefix before pyenv version display." },
      { name: "python_binary", type: "array", default: '["python", "python3", "python2"]', description: "The binary names to find the Python version." },
      { name: "detect_extensions", type: "array", default: '["py"]', description: "Which extensions trigger this module." },
      { name: "detect_files", type: "array", default: '["requirements.txt", ".python-version", "pyproject.toml", "Pipfile", "tox.ini", "setup.py", "setup.cfg", "__init__.py"]', description: "Which filenames trigger this module." },
      { name: "detect_folders", type: "array", default: "[]", description: "Which folders trigger this module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the python module." },
    ],
  },

  // ── rlang ──
  langModule("rlang", "Shows the currently installed version of R.", "rlang", "📐 ", "bold blue", '["R", "Rd", "Rmd", "Rproj", "Rsx"]', '[".Rprofile"]', '[".Rproj.user"]'),

  // ── ruby ──
  langModule("ruby", "Shows the currently installed version of Ruby.", "ruby", "💎 ", "bold red", '["rb"]', '["Gemfile", ".ruby-version"]', "[]"),

  // ── rust ──
  langModule("rust", "Shows the currently installed version of Rust.", "rust", "🦀 ", "bold red", '["rs"]', '["Cargo.toml"]', "[]"),

  // ── scala ──
  langModule("scala", "Shows the currently installed version of Scala.", "scala", "🆂 ", "bold red", '["scala", "sbt", "sc"]', '[".scalaenv", ".sbtenv", "build.sbt"]', '[".metals"]'),

  // ── shell ──
  {
    name: "shell",
    description: "Shows an indicator for the currently used shell.",
    docUrl: "https://starship.rs/config/#shell",
    formatVariables: ["indicator", "style"],
    options: [
      { name: "format", type: "string", default: '"[$indicator]($style) "', description: "The format string." },
      { name: "style", type: "string", default: '"white bold"', description: "The style for the module." },
      { name: "bash_indicator", type: "string", default: '"bsh"', description: "Shell indicator for bash." },
      { name: "fish_indicator", type: "string", default: '"fsh"', description: "Shell indicator for fish." },
      { name: "zsh_indicator", type: "string", default: '"zsh"', description: "Shell indicator for zsh." },
      { name: "powershell_indicator", type: "string", default: '"psh"', description: "Shell indicator for powershell." },
      { name: "pwsh_indicator", type: "string", default: '""', description: "Shell indicator for pwsh." },
      { name: "ion_indicator", type: "string", default: '"ion"', description: "Shell indicator for ion." },
      { name: "elvish_indicator", type: "string", default: '"esh"', description: "Shell indicator for elvish." },
      { name: "tcsh_indicator", type: "string", default: '"tsh"', description: "Shell indicator for tcsh." },
      { name: "nu_indicator", type: "string", default: '"nu"', description: "Shell indicator for nushell." },
      { name: "xonsh_indicator", type: "string", default: '"xsh"', description: "Shell indicator for xonsh." },
      { name: "cmd_indicator", type: "string", default: '"cmd"', description: "Shell indicator for cmd." },
      { name: "unknown_indicator", type: "string", default: '""', description: "Default indicator for unknown shells." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the shell module." },
    ],
  },

  // ── shlvl ──
  {
    name: "shlvl",
    description: "Shows the current SHLVL (shell level) environment variable.",
    docUrl: "https://starship.rs/config/#shlvl",
    formatVariables: ["symbol", "shlvl", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol$shlvl]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"🐚 "', description: "Symbol displayed before the SHLVL." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "threshold", type: "number", default: "2", description: "Display threshold." },
      { name: "repeat", type: "boolean", default: "false", description: "Repeat the symbol shlvl times." },
      { name: "repeat_offset", type: "number", default: "0", description: "Decrements the number of times symbol is repeated." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the shlvl module." },
    ],
  },

  // ── singularity ──
  {
    name: "singularity",
    description: "Shows the current Singularity/Apptainer image name.",
    docUrl: "https://starship.rs/config/#singularity",
    formatVariables: ["symbol", "env", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol\\[$env\\]]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '""', description: "Symbol displayed before the image name." },
      { name: "style", type: "string", default: '"bold dimmed blue"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the singularity module." },
    ],
  },

  // ── solidity ──
  langModule("solidity", "Shows the currently installed Solidity compiler version.", "solidity", "S ", "bold blue", '["sol"]', "[]", "[]"),

  // ── spack ──
  {
    name: "spack",
    description: "Shows the current Spack environment if $SPACK_ENV is set.",
    docUrl: "https://starship.rs/config/#spack",
    formatVariables: ["symbol", "environment", "style"],
    options: [
      { name: "format", type: "string", default: '"via [$symbol$environment]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"🅢 "', description: "Symbol displayed before the environment." },
      { name: "style", type: "string", default: '"bold blue"', description: "The style for the module." },
      { name: "truncation_length", type: "number", default: "1", description: "Number of directories the environment path should be truncated to." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the spack module." },
    ],
  },

  // ── status ──
  {
    name: "status",
    description: "Shows the exit code of the previous command.",
    docUrl: "https://starship.rs/config/#status",
    formatVariables: ["symbol", "status", "int", "common_meaning", "signal_name", "signal_number", "maybe_int", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol$status]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '"✖"', description: "Symbol displayed on error." },
      { name: "success_symbol", type: "string", default: '""', description: "Symbol displayed on success." },
      { name: "not_executable_symbol", type: "string", default: '"🚫"', description: "Symbol for not executable." },
      { name: "not_found_symbol", type: "string", default: '"🔍"', description: "Symbol for command not found." },
      { name: "sigint_symbol", type: "string", default: '"🧱"', description: "Symbol for SIGINT." },
      { name: "signal_symbol", type: "string", default: '"⚡"', description: "Symbol for signals." },
      { name: "style", type: "string", default: '"bold red"', description: "The style for the module." },
      { name: "recognize_signal_code", type: "boolean", default: "true", description: "Enable signal code to signal name mapping." },
      { name: "map_symbol", type: "boolean", default: "false", description: "Enable symbol mapping to status code." },
      { name: "pipestatus", type: "boolean", default: "false", description: "Enable pipestatus reporting." },
      { name: "pipestatus_format", type: "string", default: '"\\[$pipestatus\\] => [$symbol$common_meaning$signal_name$maybe_int]($style)"', description: "Format for pipestatus." },
      { name: "pipestatus_separator", type: "string", default: '"|"', description: "Separator for pipestatus." },
      { name: "pipestatus_segment_format", type: "string", default: '""', description: "Format for individual pipestatus segments." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the status module." },
    ],
  },

  // ── sudo ──
  {
    name: "sudo",
    description: "Shows if sudo credentials are currently cached.",
    docUrl: "https://starship.rs/config/#sudo",
    formatVariables: ["symbol", "style"],
    options: [
      { name: "format", type: "string", default: '"[as $symbol]($style)"', description: "The format string." },
      { name: "symbol", type: "string", default: '"🧙 "', description: "Symbol displayed when credentials are cached." },
      { name: "style", type: "string", default: '"bold blue"', description: "The style for the module." },
      { name: "allow_windows", type: "boolean", default: "false", description: "Allow sudo module to run on Windows." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the sudo module." },
    ],
  },

  // ── swift ──
  langModule("swift", "Shows the currently installed version of Swift.", "swift", "🐦 ", "bold 202", '["swift"]', '["Package.swift"]', "[]"),

  // ── terraform ──
  {
    name: "terraform",
    description: "Shows the currently selected Terraform workspace and version.",
    docUrl: "https://starship.rs/config/#terraform",
    formatVariables: ["symbol", "version", "workspace", "style"],
    options: [
      { name: "format", type: "string", default: '"via [$symbol$workspace]($style) "', description: "The format string." },
      { name: "version_format", type: "string", default: '"v${raw}"', description: "The version format." },
      { name: "symbol", type: "string", default: '"💠 "', description: "Symbol displayed before the Terraform info." },
      { name: "style", type: "string", default: '"bold 105"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the terraform module." },
      { name: "detect_extensions", type: "array", default: '["tf", "tfplan", "tfstate"]', description: "Which extensions trigger this module." },
      { name: "detect_files", type: "array", default: "[]", description: "Which filenames trigger this module." },
      { name: "detect_folders", type: "array", default: '[".terraform"]', description: "Which folders trigger this module." },
    ],
  },

  // ── time ──
  {
    name: "time",
    description: "Shows the current local time.",
    docUrl: "https://starship.rs/config/#time",
    formatVariables: ["time", "style"],
    options: [
      { name: "format", type: "string", default: '"at [$time]($style) "', description: "The format string." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "use_12hr", type: "boolean", default: "false", description: "Enables 12 hour formatting." },
      { name: "time_format", type: "string", default: '""', description: "The chrono format string for formatting the time display." },
      { name: "utc_time_offset", type: "string", default: '"local"', description: "Sets the UTC offset to use." },
      { name: "time_range", type: "string", default: '"-"', description: "Sets the time range during which the module will be shown." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the time module." },
    ],
  },

  // ── typst ──
  langModule("typst", "Shows the currently installed version of Typst.", "typst", "t ", "bold 234", '["typ"]', "[]", "[]"),

  // ── username ──
  {
    name: "username",
    description: "Shows the active user's username.",
    docUrl: "https://starship.rs/config/#username",
    formatVariables: ["user", "style"],
    options: [
      { name: "format", type: "string", default: '"[$user]($style) in "', description: "The format string." },
      { name: "style_root", type: "string", default: '"bold red"', description: "The style used when the user is root/admin." },
      { name: "style_user", type: "string", default: '"bold yellow"', description: "The style used for non-root users." },
      { name: "show_always", type: "boolean", default: "false", description: "Always shows the username module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the username module." },
      { name: "aliases", type: "object", default: "{}", description: "Table of username aliases." },
    ],
  },

  // ── vagrant ──
  langModule("vagrant", "Shows the currently installed version of Vagrant.", "vagrant", "⍱ ", "bold cyan", "[]", '["Vagrantfile"]', "[]"),

  // ── vlang ──
  langModule("vlang", "Shows the currently installed version of V.", "vlang", "V ", "bold blue", '["v"]', '["v.mod", "vpkg.json", ".vpkg-lock.json"]', "[]"),

  // ── zig ──
  langModule("zig", "Shows the currently installed version of Zig.", "zig", "↯ ", "bold yellow", '["zig"]', '["build.zig", "build.zig.zon"]', "[]"),

  // ── custom ──
  {
    name: "custom",
    description: "Custom modules allow you to show output of arbitrary commands in your prompt.",
    docUrl: "https://starship.rs/config/#custom-commands",
    formatVariables: ["symbol", "output", "style"],
    options: [
      { name: "command", type: "string", default: '""', description: "The command whose output should be printed." },
      { name: "when", type: "string", default: '""', description: "Shell command used as condition. Module is shown if exit code is 0." },
      { name: "require_repo", type: "boolean", default: "false", description: "If true, module will only be shown in a git repository." },
      { name: "shell", type: "array", default: "[]", description: "The shell to use for the command and when condition." },
      { name: "description", type: "string", default: '""', description: "A short description of the module." },
      { name: "symbol", type: "string", default: '""', description: "Symbol displayed before the command output." },
      { name: "style", type: "string", default: '"bold green"', description: "The style for the module." },
      { name: "format", type: "string", default: '"[$symbol($output )]($style)"', description: "The format string." },
      { name: "detect_files", type: "array", default: "[]", description: "Which filenames trigger this module." },
      { name: "detect_extensions", type: "array", default: "[]", description: "Which extensions trigger this module." },
      { name: "detect_folders", type: "array", default: "[]", description: "Which folders trigger this module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the custom module." },
      { name: "os", type: "string", default: '""', description: "Operating system to run on (linux, macos, windows)." },
      { name: "use_stdin", type: "boolean", default: "false", description: "Whether the command should be passed through stdin." },
      { name: "ignore_timeout", type: "boolean", default: "false", description: "Ignore the global command_timeout setting." },
    ],
  },

  // ── Additional modules (stubs with essential options) ──
  // These cover the remaining modules to reach ~70

  langModule("haxe", "Shows the currently installed version of Haxe.", "haxe", "⌘ ", "bold fg:202", '["hx"]', '["haxelib.json", "hxformat.json", ".hxrc"]', "[]"),

  {
    name: "mojo",
    description: "Shows the currently installed version of Mojo.",
    docUrl: "https://starship.rs/config/#mojo",
    formatVariables: ["symbol", "version", "style"],
    options: [
      ...commonFormatOptions.map(o => o.name === "symbol" ? { ...o, default: '"🔥 "' } : o.name === "style" ? { ...o, default: '"bold 208"' } : o),
      ...commonDetectOptions.map(o => o.name === "detect_extensions" ? { ...o, default: '["mojo", "🔥"]' } : o.name === "detect_files" ? { ...o, default: '["__mojo_init__.mojo"]' } : o),
    ],
  },

  {
    name: "nats",
    description: "Shows the NATS context.",
    docUrl: "https://starship.rs/config/#nats",
    formatVariables: ["symbol", "name", "style"],
    options: [
      { name: "format", type: "string", default: '"[$symbol$name]($style)"', description: "The format string." },
      { name: "symbol", type: "string", default: '"✉️ "', description: "Symbol displayed before the NATS info." },
      { name: "style", type: "string", default: '"bold purple"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the nats module." },
    ],
  },

  langModule("opa", "Shows the currently installed version of OPA.", "opa", "🪖 ", "bold blue", '["rego"]', "[]", "[]"),

  {
    name: "pijul_channel",
    description: "Shows the active channel of the repo in your current directory.",
    docUrl: "https://starship.rs/config/#pijul-channel",
    formatVariables: ["symbol", "channel", "style"],
    options: [
      { name: "format", type: "string", default: '"on [$symbol$channel]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '" "', description: "Symbol displayed before the channel name." },
      { name: "style", type: "string", default: '"bold purple"', description: "The style for the module." },
      { name: "truncation_length", type: "number", default: "9223372036854775807", description: "Truncate channel name to N characters." },
      { name: "truncation_symbol", type: "string", default: '"…"', description: "Symbol appended to a truncated channel name." },
      { name: "disabled", type: "boolean", default: "true", description: "Disables the pijul_channel module." },
    ],
  },

  langModule("quarto", "Shows the currently installed version of Quarto.", "quarto", "⨁ ", "bold #75AADB", "[]", '["_quarto.yml"]', "[]"),

  langModule("raku", "Shows the currently installed version of Raku.", "raku", "🦋 ", "bold 149", '["p6", "pm6", "pod6", "raku", "rakumod"]', '["META6.json"]', "[]"),

  langModule("red", "Shows the currently installed version of Red.", "red", "🔺 ", "bold red", '["red", "reds"]', "[]", "[]"),

  {
    name: "vcsh",
    description: "Shows the current active VCSH repository.",
    docUrl: "https://starship.rs/config/#vcsh",
    formatVariables: ["symbol", "repo", "style"],
    options: [
      { name: "format", type: "string", default: '"vcsh [$symbol$repo]($style) "', description: "The format string." },
      { name: "symbol", type: "string", default: '""', description: "Symbol displayed before the VCSH repo name." },
      { name: "style", type: "string", default: '"bold yellow"', description: "The style for the module." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables the vcsh module." },
    ],
  },
];

/**
 * All known module names including custom.* pattern
 */
export const allModuleNames: string[] = starshipModules.map((m) => m.name);

/**
 * Find a module by name. Supports "custom.*" pattern.
 */
export function findModule(name: string): StarshipModule | undefined {
  if (name.startsWith("custom.")) {
    return starshipModules.find((m) => m.name === "custom");
  }
  return starshipModules.find((m) => m.name === name);
}
