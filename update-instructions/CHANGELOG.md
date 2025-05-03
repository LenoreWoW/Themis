# Security Update Changelog

## Changes Made to Fix Vulnerabilities

### Dependencies Removed
- `react-mindmap`: Removed due to multiple vulnerabilities in its dependencies
- `xlsx`: Removed due to prototype pollution and ReDoS vulnerabilities
- Removed unnecessary `patch-package` since we're using more reliable overrides

### Dependencies Added
- `exceljs`: Secure alternative to `xlsx` for Excel file handling
- Added critical development dependencies:
  - `@babel/plugin-proposal-private-property-in-object`
  - `@pmmmwh/react-refresh-webpack-plugin`
  - `@testing-library` packages (jest-dom, react, user-event)
  - `@types/dompurify`
  - `@types/jest`
  - `css-loader`
  - `html-webpack-plugin`
  - `postcss-flexbugs-fixes`
  - `postcss-normalize`
  - `postcss-preset-env`
  - `source-map-loader`
  - `webpack-dev-server`

### Dependencies Updated
- `postcss`: Updated from 8.4.31 to 8.4.35
- `nth-check`: Updated to 2.1.1
- `svgo`: Updated to 3.2.0
- `css-select`: Updated to 5.1.0
- `resolve-url-loader`: Moved from dependencies to devDependencies and updated to 5.0.0

### Package.json Structure Changes
- Added "overrides" section to enforce secure versions of transitive dependencies
- Moved `react-router-dom` from devDependencies to dependencies for proper resolution
- Made sure `react-scripts` is pinned to exactly version 5.0.1
- Removed postinstall script since we're no longer using patch-package

### Specific Vulnerabilities Fixed

#### Critical Vulnerabilities
1. Prototype pollution in webpack loader-utils (GHSA-76p3-8jx3-jpfq)
2. Improper Neutralization in Shell-quote (GHSA-g4rg-993r-mgx7)
3. Multiple ReDoS vulnerabilities in loader-utils

#### High Vulnerabilities
1. Uncontrolled Resource Consumption in ansi-html (GHSA-whgm-jr23-g3j9)
2. Uncontrolled resource consumption in braces (GHSA-grv7-fg5c-xmjg)
3. Regular Expression Denial of Service in cross-spawn (GHSA-3xgq-45jj-v275)
4. REDoS vulnerability in html-minifier (GHSA-pfq8-rq6v-vf5m)
5. SSRF improper categorization in ip (GHSA-2p57-rm9w-gvfp)
6. Command Injection in lodash (GHSA-35jh-r3h4-6jhm)
7. ReDoS vulnerability in minimatch (GHSA-f8q6-p94x-37v3)
8. Multiple vulnerabilities in node-forge
9. Inefficient Regular Expression Complexity in nth-check (GHSA-rp65-9cf3-cjxr)
10. ReDoS in semver (GHSA-c2qf-rxjj-qqgw)
11. Cross-Site Scripting in serialize-javascript (GHSA-h9rv-jmmf-4pgx)
12. ReDoS in terser (GHSA-4wf5-vphf-c2xc)
13. Path traversal in webpack-dev-middleware (GHSA-wr3j-pwj9-hqq6)

#### Moderate Vulnerabilities
1. RegExp issues in browserslist (GHSA-w8qv-6jwh-64r5)
2. PostCSS line return parsing error (GHSA-7fh5-64p2-3v2j)
3. OS Command Injection in node-notifier (GHSA-5fw9-fq32-wv5p)
4. Server-Side Request Forgery in Request (GHSA-p8p7-x288-28g6)
5. Improper Input Validation in SocksJS-Node (GHSA-c9g6-9335-x697)
6. Prototype Pollution in tough-cookie (GHSA-72xf-g2v4-qvf3)
7. Prototype Pollution in yargs-parser (GHSA-p9pc-299p-vxgp)

### Additional Improvements
- Removed patches directory since we're using overrides instead
- Ensured direct dependencies are on the latest secure versions
- Fixed potential TypeScript type compatibility issues
- Updated configuration to ensure proper module resolution 