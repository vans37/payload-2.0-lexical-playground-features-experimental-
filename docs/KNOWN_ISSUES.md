# Known issues and security warnings (v1.0.2)

This is an **as-is legacy reference**, not a security-reviewed Payload plugin. The issues below are present in v1.0.2 and have not been fixed in this legacy release.

## High-priority issues

1. **Dangerous media deletion:** `src/features/custom/UploadImages/fieldHook/index.ts` can call `payloadInstance.delete(...)` on media documents no longer referenced by this one editor field, even when another document may use them. It happens during `beforeChange`; `Promise.allSettled()` failures are not properly surfaced. **Do not enable** `uploadImageHook` against valuable shared media.
2. **Unrestricted remote image requests:** the same hook calls `fetch(src)` on image URLs found in editor JSON without sufficient network, redirect, size, and type controls. With untrusted editors, this can create server-side request forgery (SSRF) and resource-exhaustion risk. Disable until hardened.
3. **Comments collection access:** `src/collections/LexicalComments.ts` has its explicit access rules commented out. `src/features/custom/Comments/fieldHook/index.ts` is unfinished. Register this collection only after implementing appropriate permissions.
4. **AI API key exposure:** `src/features/FeauturesAggregator/props/ai/index.ts` constructs a client-used Gemini adapter. Never embed a secret key there; move requests behind an authenticated server endpoint. Default key is empty, so the feature is not ready to use.
5. **Gallery HTML output:** `src/features/custom/Images/ImageGallery/converter/index.ts` injects raw image URLs into HTML and repeats modal IDs and scripts for every gallery. Sanitize untrusted content, avoid raw HTML injection, and test pages with multiple galleries.

## Functional problems / limitations

- `src/features/custom/Images/ImageGallery/nodes/GalleryNode.tsx` references `checkGalleryNode` instead of calling it at two guard sites. Validation may not work as intended.
- `richText` only adds `commentsHook` when automatic image uploading is enabled, coupling otherwise unrelated features.
- In `src/features/FeauturesAggregator/index.tsx`, `InlineImage` is commented out of `featureMap`; its source files are not equivalent to an enabled feature.
- `BlockImage` and `Gallery` use different `serverURL` conventions; see feature docs.
- Default features are numerous and include incomplete AI/comments. Override unsafe features explicitly.
- Package root `package.json` maps `exports['.'].types` to `./dist/index.js` instead of `./dist/index.d.ts` (while its `types` field is correct). `publishConfig` removes `exports` in packed tarballs; building/packing in another context may behave differently.
- Root `package.json` has `workspace:*` development dependencies and `tsconfig.json` extends a parent monorepo config; standalone source build is not plug-and-play.
- End-to-end installation has not been independently verified.
- Payload 2.x no longer receives the same level of support as current Payload versions. This package has **not** been ported to Payload 3 or 4.

