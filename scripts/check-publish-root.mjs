console.error(
  'Do not pack or publish the Git LFS checkout: its .tza files may be pointers.\n' +
  'Run npm run build, npm test, then npm publish ./dist --access public.\n' +
  'Only dist/ contains the complete, hash-verified TZA binaries.'
);
process.exitCode = 1;
