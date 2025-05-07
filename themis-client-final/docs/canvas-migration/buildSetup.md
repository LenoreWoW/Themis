# Obsidian Advanced Canvas Build Setup

## Build Toolchain

The Obsidian Advanced Canvas plugin uses **esbuild** as its primary build tool. The build configuration is defined in `esbuild.config.mjs`.

### Key Components

* **Build Tool**: esbuild (v0.19.4)
* **Language**: TypeScript (v4.7.4)
* **Style Processing**: SASS via esbuild-sass-plugin

### Build Configuration

The build process is configured in `esbuild.config.mjs` with the following key settings:

- **Entry Points**: 
  - `src/main.ts` (main JavaScript bundle)
  - `src/styles.scss` (styles)
- **Build Modes**:
  - Development mode: Watches for changes and rebuilds automatically
  - Production mode: Single build with optimizations
- **Output Format**: CommonJS (cjs)
- **Target**: ES2018
- **External Dependencies**: Multiple Obsidian and CodeMirror packages are marked as external

### NPM Scripts

- `npm run dev`: Runs the development build with file watching
- `npm run build`: Creates a production build

### Dependencies

#### Core Dependencies
- `html-to-image`: Used for canvas export functionality
- `json-stable-stringify`: Ensures consistent JSON serialization
- `monkey-around`: Utility for patching/monkey patching functionality
- `sass`: CSS preprocessor
- `tiny-jsonc`: JSON with comments parser

#### Development Dependencies
- `obsidian`: Obsidian API types and interfaces
- `typescript`: TypeScript compiler
- `esbuild`: Build system
- TypeScript linting tools

## Plugin Structure

The plugin follows a modular architecture with:

1. **Core Plugin Class**: `AdvancedCanvasPlugin` in `main.ts`
2. **Extensions System**: Multiple canvas extensions that add various features
3. **Patchers**: Modify core Obsidian functionality to add advanced features

This architecture makes the plugin highly extensible while maintaining compatibility with Obsidian's canvas implementation. 