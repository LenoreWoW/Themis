# Dependency Report for Obsidian Advanced Canvas

## Package Information

### Plugin Metadata (manifest.json)
- **ID**: advanced-canvas
- **Name**: Advanced Canvas
- **Version**: 4.1.0
- **Minimum Obsidian Version**: 1.1.0
- **Description**: Supercharge your canvas experience! Create presentations, flowcharts and more!
- **Author**: Developer-Mike
- **Author URL**: https://github.com/Developer-Mike
- **Desktop Only**: No

### Entry Points
- Main JavaScript Entry: `src/main.ts` (compiled to `main.js`)
- Main Style Entry: `src/styles.scss` (compiled to `styles.css`)

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| esbuild-sass-plugin | ^2.6.0 | SASS processing integration with esbuild |
| html-to-image | ^1.11.11 | Canvas export to image functionality |
| json-stable-stringify | ^1.2.1 | Consistent JSON serialization |
| monkey-around | ^2.3.0 | Utility for patching/monkey patching Obsidian's core functionality |
| sass | ^1.70.0 | CSS preprocessor |
| tiny-jsonc | ^1.0.1 | JSON with comments parser |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @types/node | ^16.11.6 | TypeScript definitions for Node.js |
| @typescript-eslint/eslint-plugin | 5.29.0 | TypeScript linting |
| @typescript-eslint/parser | 5.29.0 | TypeScript parser for ESLint |
| builtin-modules | 3.3.0 | List of built-in Node.js modules |
| esbuild | 0.19.4 | Fast JavaScript bundler |
| obsidian | latest | Obsidian API types and interfaces |
| tslib | 2.4.0 | TypeScript runtime library |
| typescript | 4.7.4 | TypeScript compiler |

## External Dependencies

The plugin declares the following packages as external dependencies in its build configuration:

- obsidian
- electron
- @codemirror/autocomplete
- @codemirror/collab
- @codemirror/commands
- @codemirror/language
- @codemirror/lint
- @codemirror/search
- @codemirror/state
- @codemirror/view
- @lezer/common
- @lezer/highlight
- @lezer/lr
- Node.js built-in modules

These are not bundled with the plugin but are expected to be provided by the Obsidian environment. 