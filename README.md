# Lexical Custom Features for Payload CMS 2.x

Community / experimental additions to [Payload CMS](https://github.com/payloadcms/payload) 2.x's Lexical rich-text editor, adapted from Lexical Playground and Payload's original feature implementations.

> **Legacy project / archived v2 code.** This is the original **1.0.2** implementation, not a Payload 3/4 port. The implementation has not been revalidated against newer dependencies. Use in a **local or trusted test environment first**. Do not enable everything unchanged on a public instance. See [security notes](docs/KNOWN_ISSUES.md).

## What's inside?

- Image galleries and block-image editing
- Tables, resizing, and table action menus
- Multi-column layouts and collapsible sections
- Video/social embeds (YouTube, Twitter/X, Rutube, VK)
- Text color, background, font size, font picker, and clear formatting
- Context menu, drag/drop/paste, undo/redo, editor actions
- Toolbar changes, localization helpers, and HTML converters
- **Experimental** comments and AI assistant (not safe to assume production-ready)

This repository preserves the Payload 2 version of the custom feature package. Its implementation is kept as-is for existing applications and for reference.

## Quick start: existing Payload 2 application

1. Use **Payload 2.x**, preferably the original development baseline **2.32.2** with `@payloadcms/richtext-lexical` **0.11.4** and Lexical **0.13.1**. Do not install the current `latest` packages (they target newer Payload versions).
2. Download the **`lexical-custom-features-1.0.2.tgz`** release asset from the repository release, or build this project in a compatible Payload 2 monorepo (see [installation](docs/INSTALLATION.md)). The tarball is **not published to npm by these instructions**.
3. From your Payload 2 application, install the downloaded tarball and align its peer dependencies as described in [Installation](docs/INSTALLATION.md).
4. Register a test collection using [examples/Posts.ts](examples/Posts.ts) and add it to `collections` in your Payload config.
5. Run the admin panel, add a post, format text, save, and reload. Test other features only after the basic workflow succeeds.

Basic field usage (from `src/fields/richTextLexical.ts`):

```ts
import { richText } from 'lexical-custom-features'

const contentField = richText({
  fieldName: 'content',
  uploadImageHook: { enabled: false, uploadCollection: 'media' },
  featureProps: {
    AIAssistant: { enabled: false },
    Comments: { enabled: false },
    Gallery: { enabled: false },
    BlockImage: { enabled: false },
  },
})
```

> The field factory uses a **default-enabled feature set**. `featureProps` *overrides* individual defaults; it is not an allowlist. Disable features explicitly until you have configured and tested them. The `uploadImageHook` object is required by the current TypeScript interface even when disabled.

## Documentation

- [Installation in an existing Payload 2 project](docs/INSTALLATION.md)
- [Testing locally, including the original monorepo playground](docs/TESTING.md)
- [Features and configuration](docs/FEATURES.md)
- [Known issues, security considerations, and limitations](docs/KNOWN_ISSUES.md)
- [Package exports and structure](docs/DEVELOPMENT.md)

## Compatibility

| Dependency | Version referenced by the original code/archive |
| --- | --- |
| `payload` | `2.32.2` was used in the source monorepo; package peer range is `^2.30.0` |
| `@payloadcms/richtext-lexical` | `0.11.4` in source monorepo; package peer range `^0.11.3` |
| `lexical` and related `@lexical/*` | `0.13.1` |
| `react` / `react-dom` | Tested dependency context was React 18.x (v2 package peer ranges include earlier React) |

This is **not compatible with Payload 3.x / 4.x** without migration. Installation/build instructions are provided for the original version combinations, but **a fresh end-to-end installation has not been verified**.

## Status and contributing

Released **as is** as a reference and starting point for people maintaining Payload 2 applications. Bug reports and fixes may still be valuable, but functionality is experimental. For safer use, prefer disabling AI, comments, and automatic image fetching/deletion until issues are addressed.

## Attribution and license

Package metadata declares MIT. Much of the code is adapted from upstream Payload and Meta Lexical Playground. See [NOTICE.md](NOTICE.md), the included [LICENSE](LICENSE), and asset-level license files under `src/`. Retain upstream notices when redistributing.
