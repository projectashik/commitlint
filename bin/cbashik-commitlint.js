#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawnSync } = require("child_process");

const args = process.argv.slice(2);
const askMode = args.includes("--ask");

if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  printUsage();
  process.exit(0);
}

if (!args.includes("--init")) {
  printUsage();
  process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function main() {
  if (askMode && !process.stdin.isTTY) {
    console.error("The --ask flag requires an interactive terminal.");
    process.exit(1);
  }

  const cwd = process.cwd();
  const packageJsonPath = path.join(cwd, "package.json");

  if (!fileExists(packageJsonPath)) {
    console.error("No package.json found in the current directory.");
    process.exit(1);
  }

  const packageJson = readJson(packageJsonPath);
  const detectedPackageManager = detectPackageManager(cwd);
  const prompter = askMode ? createPrompter() : null;

  let packageManager = detectedPackageManager;
  let wantsHusky = true;
  let shouldAddConfig = true;

  const packagesToInstall = [];
  addIfMissing(packageJson, packagesToInstall, "@cbashik/commitlint");
  addIfMissing(packageJson, packagesToInstall, "@commitlint/cli");

  const hasGit = fileExists(path.join(cwd, ".git"));
  const huskyShim = path.join(cwd, ".husky", "_", "husky.sh");
  const needsHuskyInit = hasGit && !fileExists(huskyShim);

  try {
    if (askMode) {
      packageManager = await promptPackageManager(
        prompter,
        detectedPackageManager
      );
      wantsHusky = hasGit
        ? await promptYesNo(
            prompter,
            "Set up Husky and commit-msg hook?",
            true
          )
        : false;
      shouldAddConfig = await promptYesNo(
        prompter,
        "Add commitlint config to package.json?",
        true
      );
    }

    const needsHuskyDependency =
      wantsHusky && needsHuskyInit && !hasDependency(packageJson, "husky");

    if (needsHuskyDependency) {
      packagesToInstall.push("husky");
    }

    const pmConfig = getPackageManagerConfig(packageManager);

    console.log(`Using package manager: ${packageManager}`);

    if (shouldAddConfig) {
      ensureCommitlintConfig(cwd, packageJsonPath, packageJson);
    } else {
      console.log("Skipping commitlint config setup.");
    }

    let shouldInstall = packagesToInstall.length > 0;

    if (packagesToInstall.length > 0) {
      if (askMode) {
        shouldInstall = await promptYesNo(
          prompter,
          `Install dev dependencies (${packagesToInstall.join(", ")})?`,
          true
        );
      }

      if (shouldInstall) {
        console.log(
          `Installing dev dependencies: ${packagesToInstall.join(", ")}`
        );
        const installArgs = pmConfig.install.args.concat(packagesToInstall);
        runCommand(pmConfig.install.command, installArgs);
      } else {
        console.log("Skipping dependency install.");
      }
    } else {
      console.log("Dependencies already present, skipping install.");
    }

    if (!hasGit) {
      console.log("No .git directory found; skipping Husky setup.");
      return;
    }

    let skipHuskyReason = null;

    if (!wantsHusky) {
      skipHuskyReason = "Skipping Husky setup by user choice.";
    } else if (!shouldInstall && needsHuskyDependency) {
      skipHuskyReason =
        "Husky is not installed; skipping Husky setup. " +
        "Install it and rerun init.";
    }

    if (skipHuskyReason) {
      console.log(skipHuskyReason);
      return;
    }

    if (needsHuskyInit) {
      console.log("Initializing Husky...");
      runCommand(pmConfig.husky.command, pmConfig.husky.args);
    } else {
      console.log("Husky already initialized, skipping install.");
    }

    ensureCommitMsgHook(cwd, pmConfig.hookCommand);
  } finally {
    if (prompter) {
      prompter.close();
    }
  }
}

function printUsage() {
  console.log("Usage: cbashik-commitlint --init [--ask]");
  console.log("  --ask  prompt for each option with defaults");
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Failed to read ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function writeJson(filePath, value) {
  try {
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  } catch (error) {
    console.error(`Failed to write ${filePath}: ${error.message}`);
    process.exit(1);
  }
}

function hasDependency(packageJson, name) {
  const sections = [
    packageJson.dependencies,
    packageJson.devDependencies,
    packageJson.optionalDependencies,
    packageJson.peerDependencies,
  ];

  return sections.some((deps) => deps && deps[name]);
}

function addIfMissing(packageJson, list, name) {
  if (!hasDependency(packageJson, name)) {
    list.push(name);
  }
}

function createPrompter() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    question(prompt) {
      return new Promise((resolve) => {
        rl.question(prompt, (answer) => resolve(answer));
      });
    },
    close() {
      rl.close();
    },
  };
}

async function promptYesNo(prompter, label, defaultValue) {
  const hint = defaultValue ? "Y/n" : "y/N";

  while (true) {
    const answer = (await prompter.question(`${label} (${hint}): `))
      .trim()
      .toLowerCase();

    if (!answer) {
      return defaultValue;
    }

    if (answer === "y" || answer === "yes") {
      return true;
    }

    if (answer === "n" || answer === "no") {
      return false;
    }

    console.log("Please answer yes or no.");
  }
}

async function promptPackageManager(prompter, defaultValue) {
  const options = ["npm", "pnpm", "yarn", "bun"];
  const label = options.join("/");

  while (true) {
    const answer = (await prompter.question(
      `Package manager (${label}) [${defaultValue}]: `
    ))
      .trim()
      .toLowerCase();

    if (!answer) {
      return defaultValue;
    }

    if (options.includes(answer)) {
      return answer;
    }

    console.log(`Please choose one of: ${options.join(", ")}.`);
  }
}

function detectPackageManager(cwd) {
  const lockfiles = [
    { name: "bun", files: ["bun.lockb", "bun.lock"] },
    { name: "pnpm", files: ["pnpm-lock.yaml"] },
    { name: "yarn", files: ["yarn.lock"] },
    { name: "npm", files: ["package-lock.json", "npm-shrinkwrap.json"] },
  ];

  for (const entry of lockfiles) {
    if (entry.files.some((file) => fileExists(path.join(cwd, file)))) {
      return entry.name;
    }
  }

  return "npm";
}

function getPackageManagerConfig(name) {
  const configs = {
    bun: {
      install: { command: "bun", args: ["add", "-d"] },
      husky: { command: "bunx", args: ["husky"] },
      hookCommand: "bunx commitlint --edit \"$1\"",
    },
    pnpm: {
      install: { command: "pnpm", args: ["add", "-D"] },
      husky: { command: "pnpm", args: ["exec", "husky"] },
      hookCommand: "pnpm exec commitlint --edit \"$1\"",
    },
    yarn: {
      install: { command: "yarn", args: ["add", "--dev"] },
      husky: { command: "yarn", args: ["husky"] },
      hookCommand: "yarn commitlint --edit \"$1\"",
    },
    npm: {
      install: { command: "npm", args: ["install", "--save-dev"] },
      husky: { command: "npx", args: ["husky"] },
      hookCommand: "npx --no -- commitlint --edit \"$1\"",
    },
  };

  return configs[name] || configs.npm;
}

function runCommand(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

function ensureCommitlintConfig(cwd, packageJsonPath, packageJson) {
  if (packageJson.commitlint) {
    console.log("commitlint config found in package.json, skipping update.");
    return;
  }

  const configFiles = [
    "commitlint.config.js",
    "commitlint.config.cjs",
    "commitlint.config.mjs",
    "commitlint.config.ts",
    "commitlint.config.cts",
    "commitlint.config.mts",
    "commitlint.config.json",
  ];

  const hasConfig = configFiles.some((file) =>
    fileExists(path.join(cwd, file))
  );
  if (hasConfig) {
    console.log(
      "commitlint config file already exists, skipping package.json update."
    );
    return;
  }

  packageJson.commitlint = { extends: ["@cbashik/commitlint"] };
  writeJson(packageJsonPath, packageJson);
  console.log("Added commitlint config to package.json.");
}

function ensureCommitMsgHook(cwd, hookCommand) {
  const huskyDir = path.join(cwd, ".husky");
  fs.mkdirSync(huskyDir, { recursive: true });

  const hookPath = path.join(huskyDir, "commit-msg");
  if (!fileExists(hookPath)) {
    const contents = [
      "#!/bin/sh",
      ". \"$(dirname \"$0\")/_/husky.sh\"",
      "",
      hookCommand,
      "",
    ].join("\n");
    fs.writeFileSync(hookPath, contents, "utf8");
    fs.chmodSync(hookPath, 0o755);
    console.log("Created .husky/commit-msg hook.");
    return;
  }

  const existing = fs.readFileSync(hookPath, "utf8");
  if (existing.includes("commitlint")) {
    console.log("commit-msg hook already runs commitlint, skipping update.");
    return;
  }

  const updated = `${existing.trimEnd()}\n\n${hookCommand}\n`;
  fs.writeFileSync(hookPath, updated, "utf8");
  fs.chmodSync(hookPath, 0o755);
  console.log("Updated .husky/commit-msg hook to run commitlint.");
}
