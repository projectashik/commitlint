# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] - 2026-01-28

### Changed
- Release 1.1.1 (no functional changes).

## [1.1.0] - 2026-01-28

### Added
- `--init` CLI to install dependencies, scaffold commitlint config, and set up
  Husky commit-msg hooks.
- `--ask` flag to prompt for each init option with defaults preselected.

### Changed
- `--init` now writes commitlint config into `package.json` instead of creating
  a `commitlint.config.js` file.
- `--init` uses the recommended `husky` command to avoid deprecated
  `husky install`.

## [1.0.2] - 2024-10-09

### Changed
- Updated repository URLs after renaming GitHub repo from `cbashik-commitlint` to `commitlint`
- Updated help URL in configuration to point to new repository location

## [1.0.1] - 2024-10-09

### Changed
- Updated repository URLs to correct GitHub repository
- Fixed package metadata links

## [1.0.0] - 2024-10-09

### Added
- Initial release of @cbashik/commitlint
- Custom commitlint configuration extending @commitlint/config-conventional
- Additional commit types: `hotfix`, `release`
- Enhanced validation rules:
  - Header length: 10-100 characters
  - Subject length: 3-80 characters
  - Scope max length: 20 characters
- Custom help URL for better developer experience
- Comprehensive documentation and usage examples

### Features
- Support for all conventional commit types
- Custom commit types for hotfixes and releases
- Strict validation rules for consistent commit messages
- Easy integration with existing projects
- Husky integration examples
