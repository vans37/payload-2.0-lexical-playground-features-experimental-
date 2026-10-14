# Testing the Payload 2 version

## Smoke-test in an existing Payload 2 application (simplest)

1. Install as described in [INSTALLATION.md](INSTALLATION.md).
2. Register [../examples/Posts.ts](../examples/Posts.ts) in your Payload config.
3. Start your app and open `/admin/collections/posts`.
4. Add a post, enter headings/paragraphs/bold/links, save, and reload.
5. Check saved JSON through the Payload API or database. It should contain a Lexical `root` with `children` and node `type` values.
6. Only then enable individual custom features and test one at a time.

The `Posts` example does **not** need an upload collection because it disables automatic image upload and image-specific features. The placeholder slug `media` in `uploadImageHook` is ignored when `enabled` is `false`.

## Reproduce the author's original v2 monorepo playground

The feature package was developed against the Payload 2.32.2 monorepo. The relevant areas were:

- `packages/lexical-custom-features/` — this custom package;
- `test/fields/collections/LexicalPlayground/index.ts` — real usage example with two `richText(...)` fields;
- `test/fields/config.ts` — `LexicalComments` registration and a test app config;
- `test/dev.ts` — the Express development runner;
- `nodemon.json` — runs `ts-node ./test/dev.ts` for a selected test suite;
- `test/buildConfigWithDefaults.ts` — chooses webpack/Vite and Mongo/Postgres.

To explore the Payload 2 test runner, use a locally configured copy of the 2.32.2 monorepo:

```bash
# From your Payload 2 monorepo root:
pnpm install
pnpm dev fields
```

This is the test suite name indicated by `test/fields/config.ts`. The test application may seed/reset the database. In `test/dev.ts`, `PAYLOAD_DROP_DATABASE` defaults to `true` unless set to the literal string `false`.

### PostgreSQL in the old test runner (optional)

The Payload 2 test runner selects PostgreSQL when `PAYLOAD_DATABASE=postgres`, and reads `POSTGRES_URL`. Set up any local Postgres database and run:

```bash
PAYLOAD_DATABASE=postgres \
POSTGRES_URL='postgres://payload:payload@127.0.0.1:5432/payloadtests' \
PAYLOAD_DROP_DATABASE=false \
pnpm dev fields
```

Use your own database/credentials; this is **only an example connection string**, not a provided Docker service. The stock test config includes seeding logic (`clearAndSeedEverything`) that may still destroy/recreate documents even if the schema-drop switch is disabled. Use a disposable database. This workflow has not been independently verified.

### Configure upload storage for local testing

The original test playground included an S3-backed media configuration. For local testing, use a Payload upload collection with local file storage, or configure your own object storage through environment variables. No remote storage service is required for basic rich-text editing.

## Next feature to test: a local gallery

Once basic formatting works:

1. Create a Payload upload collection with slug `media` and local file storage (e.g. `upload: { staticDir: ... }`).
2. Set gallery feature `collections` to `{ media: { serverURL: 'http://localhost:3000' } }` so image paths use `/media/<filename>`.
3. Set block-image `serverURL` to `'http://localhost:3000/media'` because that feature builds `<serverURL>/<filename>`.
4. Keep `uploadImageHook.enabled = false` during initial testing. Test gallery selection, saving/reloading, and multiple galleries per document. The HTML gallery converter has known limitations.

Example configuration: [../examples/Posts.with-gallery.ts](../examples/Posts.with-gallery.ts).

## Suggested manual regression checklist

- [ ] Formatting survives save and reload.
- [ ] A custom gallery serializes to JSON and restores in the editor.
- [ ] Removing an image node does **not** unexpectedly destroy a referenced media document (keep automatic deletion disabled in this test).
- [ ] Multiple galleries produce valid UI; multiple-gallery HTML export is a known limitation.
- [ ] A custom layout and a collapsible block survive save and reload.
- [ ] Rich text HTML conversion handles text safely; review converters before displaying untrusted HTML.
- [ ] Media URLs reflect the collection/storage configuration.
- [ ] Reopening old serialized documents does not drop unknown custom nodes.

There is no passing automated test suite or verified compatibility matrix shipped with this documentation. Treat all results as provisional until you run them in your own environment.
