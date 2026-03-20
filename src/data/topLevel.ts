export interface TopLevelOption {
  name: string;
  type: "string" | "number" | "boolean" | "object";
  default: string;
  description: string;
  docUrl: string;
}

export const topLevelOptions: TopLevelOption[] = [
  {
    name: "format",
    type: "string",
    default: '"$all"',
    description:
      "The format string used to configure the prompt. Variables like $module_name are replaced by the module output.",
    docUrl: "https://starship.rs/config/#prompt",
  },
  {
    name: "right_format",
    type: "string",
    default: '""',
    description:
      "The format string for the right side of the prompt (supported by some shells).",
    docUrl: "https://starship.rs/config/#prompt",
  },
  {
    name: "continuation_prompt",
    type: "string",
    default: '"[∙](bright-black) "',
    description:
      "The continuation prompt shown for multi-line input in supported shells.",
    docUrl: "https://starship.rs/config/#prompt",
  },
  {
    name: "scan_timeout",
    type: "number",
    default: "30",
    description:
      "Timeout in milliseconds for starship to scan files in the current directory.",
    docUrl: "https://starship.rs/config/#prompt",
  },
  {
    name: "command_timeout",
    type: "number",
    default: "500",
    description:
      "Timeout in milliseconds for commands executed by starship.",
    docUrl: "https://starship.rs/config/#prompt",
  },
  {
    name: "add_newline",
    type: "boolean",
    default: "true",
    description:
      "Inserts a blank line between shell prompts.",
    docUrl: "https://starship.rs/config/#prompt",
  },
  {
    name: "palette",
    type: "string",
    default: '""',
    description:
      "Sets the active color palette from the palettes table.",
    docUrl: "https://starship.rs/config/#prompt",
  },
  {
    name: "palettes",
    type: "object",
    default: "{}",
    description:
      "A table of color palettes mapping color names to hex values.",
    docUrl: "https://starship.rs/config/#prompt",
  },
];
