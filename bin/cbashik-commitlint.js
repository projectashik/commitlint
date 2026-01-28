#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h") || args.length === 0) {
  printUsage();
  process.exit(0);
}

if (!args.includes("--init")) {
  printUsage();
  process.exit(1);
}

const cwd = process.cwd();
const packageJsonPath = path.join(cwd, "package.json");

if (!fileExists(packageJsonPath)) {
  console.error("No package.json found in the current directory.");
  process.exit(1);
}

const packageJson = readJson(packageJsonPath);
const packageManager = detectPackageManager(cwd);
const pmConfig = getPackageManagerConfig(packageManager);

console.log(`Using package manager: ${packageManager}`);

const packagesToInstall = [];
addIfMissing(packageJson, packagesToInstall, "@cbashik/commitlint");
addIfMissing(packageJson, packagesToInstall, "@commitlint/cli");

const hasGit = fileExists(path.join(cwd, ".git"));
const huskyShim = path.join(cwd, ".husky", "_", "husky.sh");
const needsHuskyInit = hasGit && !fileExists(huskyShim);

if (needsHuskyInit && !hasDependency(packageJson, "husky")) {
  packagesToInstall.push("husky");
}

if (packagesToInstall.length > 0) {
  console.log(`Installing dev dependencies: ${packagesToInstall.join(", ")}`);
  const installArgs = pmConfig.install.args.concat(packagesToInstall);
  runCommand(pmConfig.install.command, installArgs);
} else {
  console.log("Dependencies already present, skipping install.");
}

ensureCommitlintConfig(cwd, packageJson);

if (!hasGit) {
  console.log("No .git directory found; skipping Husky setup.");
  process.exit(0);
}

if (needsHuskyInit) {
  console.log("Initializing Husky...");
  runCommand(pmConfig.husky.command, pmConfig.husky.args);
} else {
  console.log("Husky already initialized, skipping install.");
}

ensureCommitMsgHook(cwd, pmConfig.hookCommand);

function printUsage() {
  console.log("Usage: cbashik-commitlint --init");
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
      husky: { command: "bunx", args: ["husky", "install"] },
      hookCommand: "bunx commitlint --edit \"$1\"",
    },
    pnpm: {
      install: { command: "pnpm", args: ["add", "-D"] },
      husky: { command: "pnpm", args: ["exec", "husky", "install"] },
      hookCommand: "pnpm exec commitlint --edit \"$1\"",
    },
    yarn: {
      install: { command: "yarn", args: ["add", "--dev"] },
      husky: { command: "yarn", args: ["husky", "install"] },
      hookCommand: "yarn commitlint --edit \"$1\"",
    },
    npm: {
      install: { command: "npm", args: ["install", "--save-dev"] },
      husky: { command: "npx", args: ["husky", "install"] },
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

function ensureCommitlintConfig(cwd, packageJson) {
  if (packageJson.commitlint) {
    console.log("commitlint config found in package.json, skipping file write.");
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
    console.log("commitlint config file already exists, skipping write.");
    return;
  }

  const configPath = path.join(cwd, "commitlint.config.js");
  const contents = [
    "module.exports = {",
    "  extends: [\"@cbashik/commitlint\"],",
    "};",
    "",
  ].join("\n");
  fs.writeFileSync(configPath, contents, "utf8");
  console.log("Created commitlint.config.js.");
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
