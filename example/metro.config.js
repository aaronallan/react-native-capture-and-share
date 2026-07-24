const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the library source in the workspace root, not just this app, so edits to ../src
// take effect without a build - Metro resolves the package to src/index.ts via its
// "react-native" field. Deliberately does NOT set disableHierarchicalLookup: true - that
// option (common in monorepo Metro configs to force a single resolved copy of shared deps)
// breaks resolution of legitimately-nested, non-hoisted transitive deps like
// node_modules/expo/node_modules/@expo/log-box, which need the normal upward node_modules
// walk to be found.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
