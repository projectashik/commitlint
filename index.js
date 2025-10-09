module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Header rules
    "header-max-length": [2, "always", 100],
    "header-min-length": [2, "always", 10],

    // Type rules
    "type-enum": [
      2,
      "always",
      [
        "feat", // A new feature
        "fix", // A bug fix
        "docs", // Documentation only changes
        "style", // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        "refactor", // A code change that neither fixes a bug nor adds a feature
        "perf", // A code change that improves performance
        "test", // Adding missing tests or correcting existing tests
        "build", // Changes that affect the build system or external dependencies
        "ci", // Changes to our CI configuration files and scripts
        "chore", // Other changes that don't modify src or test files
        "revert", // Reverts a previous commit
        "hotfix", // Critical fixes that need immediate deployment
        "release", // Release commits
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],

    // Scope rules
    "scope-case": [2, "always", "lower-case"],
    "scope-max-length": [2, "always", 20],

    // Subject rules
    "subject-case": [
      2,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-min-length": [2, "always", 3],
    "subject-max-length": [2, "always", 80],

    // Body rules
    "body-leading-blank": [1, "always"],
    "body-max-line-length": [2, "always", 100],
    "body-min-length": [0, "always", 0], // Optional body

    // Footer rules
    "footer-leading-blank": [1, "always"],
    "footer-max-line-length": [2, "always", 100],

    // Additional custom rules
    "signed-off-by": [0, "never"], // Disable signed-off-by requirement
    "trailer-exists": [0, "never"], // Disable trailer requirement
  },

  // Custom parser options
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\(([^\)]*)\))?: (.*)$/,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },

  // Help URL for developers
  helpUrl:
    "https://github.com/projectashik/cbashik-commitlint#commit-message-format",
};
