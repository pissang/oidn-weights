# Intel® Open Image Denoise weights

This repository contains trained weights of convolutional neural networks (CNN)
used by filters in Intel Open Image Denoise (released under the [Apache 2.0
license](http://www.apache.org/licenses/LICENSE-2.0)), stored in a custom binary
format. See the [main source repository](https://github.com/OpenImageDenoise/oidn)
for code that parses and uses these weights.


## npm distribution

This fork adds npm packaging to the original weights repository. The networks
are unchanged. Package version `2.3.0` matches Intel Open Image Denoise `v2.3.0`,
whose weights submodule points to upstream commit
`28883d1769d5930e13cf7f1676dd852bd81ed9e7`.

```sh
npm install oidn-weights@2.3.0
```

All 23 upstream `.tza` files are included at the package root. Standard, small,
large beauty, albedo and normal networks are available at:

```text
https://cdn.jsdelivr.net/npm/oidn-weights@2.3.0/<filename>.tza
```

For MuTracer's `cleanAuxLarge`, use `rt_hdr_calb_cnrm_large.tza` with the
`rt_alb_large.tza` and `rt_nrm_large.tza` auxiliary networks. To self-host,
copy the files from `node_modules/oidn-weights/` to static assets and pass
`weightsBaseUrl` to the renderer's denoiser options.

## Build and publish

Requires Node.js 18+ and curl. The Git checkout uses Git LFS pointers; do not
publish the checkout directly. The build downloads the actual binaries from the
pinned upstream commit into `dist/` and verifies every file's SHA-256, size and
TZA magic against `weights-manifest.json` before preparing the package. It does
not need Git LFS, and leaves the tracked upstream files unchanged.

```sh
npm run build
npm test
npm pack ./dist --dry-run
npm publish ./dist --access public
```

The published package preserves the upstream Apache 2.0 license. For a future
release, select the weights commit referenced by that OIDN release, update the
manifest and package version together, then verify and publish the new version.
