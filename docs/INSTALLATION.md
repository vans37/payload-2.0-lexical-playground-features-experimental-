# Installation — Payload CMS 2.x

This guide assumes you **already have a functioning Payload 2 application**. The package is not a standalone CMS and will not add a database/server by itself.

## Prerequisites

- Payload **2.x**, preferably `2.32.2`, with the corresponding v2 webpack-based admin panel.
- `@payloadcms/richtext-lexical` from the **0.11.x** line (`0.11.4` matches the original Payload 2.32.2 development environment).
- Lexical packages on **0.13.1**; incompatible mixed Lexical versions can cause node registration/runtime errors.
- A working `pnpm`, Node.js, database and Payload 2 app. Retain your application's original Node version instead of upgrading to the latest blindly.

**Do not use** `pnpm add @payloadcms/richtext-lexical@latest` for a Payload 2 application.

## Option A — use the prebuilt 1.0.2 tarball (recommended for application users)

The `lexical-custom-features-1.0.2.tgz` release asset contains compiled `dist/`, `.d.ts` files, styles, and package metadata. Download it from the project's GitHub release assets (once attached) and place it in your application root. From **your application**:

```bash
# Confirm these are on the Payload 2 / Lexical 0.13 line first:
pnpm list payload @payloadcms/richtext-lexical lexical

# Install the local package archive:
pnpm add ./lexical-custom-features-1.0.2.tgz
```

Make sure the application's editor is on the matched versions; if it is not already, update to versions appropriate for your Payload 2 application, for example:

```bash
pnpm add payload@2.32.2 @payloadcms/richtext-lexical@0.11.4 lexical@0.13.1
```

The package's declared peers also require these Lexical modules. If they are not already direct dependencies of your app, install them **at the same 0.13.1 version**:

```bash
pnpm add \
  @lexical/code@0.13.1 @lexical/dragon@0.13.1 \
  @lexical/hashtag@0.13.1 @lexical/history@0.13.1 \
  @lexical/overflow@0.13.1 @lexical/plain-text@0.13.1 \
  @lexical/table@0.13.1 @lexical/text@0.13.1 \
  @lexical/headless@0.13.1 @lexical/link@0.13.1 \
  @lexical/list@0.13.1 @lexical/mark@0.13.1 \
  @lexical/markdown@0.13.1 @lexical/react@0.13.1 \
  @lexical/rich-text@0.13.1 @lexical/selection@0.13.1 \
  @lexical/utils@0.13.1 \
  @faceless-ui/modal@2.0.2 \
  @faceless-ui/scroll-info@2.0.0-beta.0 \
  @faceless-ui/window-info@2.1.1
```

**Avoid `--force` or `--legacy-peer-deps` as a first response to version errors.** Check the installed versions and the conflicting package first.

### Register a field and collection

Copy [../examples/Posts.ts](../examples/Posts.ts) into your app's collections directory (or adapt its `richText(...)` field into an existing collection), and register it in your **Payload 2** `buildConfig`:

```ts
import { Posts } from './collections/Posts'

export default buildConfig({
  // Keep your existing db/admin/editor/secret/etc. configuration.
  collections: [Posts /*, ... your other collections */],
})
```

The sample deliberately disables comments, AI, galleries, block images, and automatic image upload while you verify basic editing. The package itself still initializes its other default features.

If your application already uses a v2 `lexicalEditor({})` at the top level, the `richText(...)` field will override the editor **for that field**.

Start your existing Payload 2 app as normal. Create a post, enter plain/formatted text, save, reload, then check the stored Lexical JSON.

## Option B — edit / develop the source inside Payload 2 monorepo

The checked-in `package.json` and `tsconfig.json` were authored **inside the Payload 2 monorepo**, not as a self-contained standalone build. Notably, they contain `workspace:*` dev dependencies, relative TS config references, and a build depending on SWC / copying assets. Running `pnpm install && pnpm build` at this repository root is **not a supported standalone build process** without adapting them.

For source experimentation:

```bash
git clone --branch v2.32.2 https://github.com/payloadcms/payload.git payload-v2
cd payload-v2
# Copy THIS repository's src/, package.json, tsconfig.json, .swcrc into:
# packages/lexical-custom-features/
pnpm install
```

In Payload 2, this package can live at `packages/lexical-custom-features/` and be imported from a local test collection or application.


## UI styles / bundler caveat

`src/features/FeauturesAggregator/index.tsx` imports the package's SCSS. The prebuilt archive includes `.scss` assets and compiled JS, but does not bundle a single standalone CSS file. Your Payload 2 webpack/Sass configuration needs to handle the package styles. If a build fails on `.scss`, inspect the bundler setup before modifying the feature logic.

## Uninstall

Remove the custom field registration, revert to Payload's `lexicalEditor` if desired, then remove the tarball dependency. **Back up rich-text JSON first**: data created by custom nodes (e.g. galleries/layouts) is not guaranteed to load in the stock editor without corresponding node definitions or a migration.
