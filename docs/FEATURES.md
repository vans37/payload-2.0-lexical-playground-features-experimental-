# Features and configuration reference

This page was derived from `src/features/FeauturesAggregator/index.tsx`, `src/features/FeauturesAggregator/props/*`, and the public `src/index.ts` exports in the supplied v1.0.2 source.

## The field factory

```ts
import { richText } from 'lexical-custom-features'

richText({
  fieldName: 'content',
  uploadImageHook: {
    enabled: false,
    uploadCollection: 'media',
  },
  featureProps: {
    Comments: { enabled: false },
    AIAssistant: { enabled: false },
    Gallery: { enabled: false },
    BlockImage: { enabled: false },
  },
})
```

`richText(props, overWrites?)` constructs a Payload `richText` field, configures `lexicalEditor(...)`, and merges `overWrites` into the field via the package's `deepMerge`. Its `props` include:

| Option | Meaning |
| --- | --- |
| `fieldName: string` | Required field name |
| `featureProps?: EnabledFeatures` | Per-feature `enabled` switches and optionally `props` |
| `uploadImageHook: { enabled: boolean; uploadCollection: string }` | Required by TS, turns on pre-save remote/base64 image handling when enabled |
| `hooks?` | Payload field hook lists (before/after change and read, beforeValidate) |
| `editor?` | Declared in the type but **not used** in the implementation (custom `lexicalEditor` is always constructed) |
| `overWrites` (second argument) | Deep-merged Payload field overrides; behavior depends on package merge helper |

**Important:** `featureProps` is merged with defaults. Supplying a map with only `Gallery` does not disable the other defaults.

## `featureProps` keys

Keys and defaults in `featureMap` / `enabledFeaturesByDefault`:

| Feature key | Enabled by default | Notes |
| --- | --- | --- |
| `Gallery` | Yes | Requires `collections` URL config for real media |
| `BlockImage` | Yes | Requires `serverURL` (see caveat below) |
| `Comments` | Yes | Experimental; collection access is not secured by default |
| `AIAssistant` | Yes | Experimental; default Gemini adapter uses an empty key; do **not** put keys in frontend code |
| `Table`, `TableActionMenu`, `TableCellResizer`, `TableHoverActions` | Yes | Table editing UI |
| `Embed` | Yes | YouTube, Twitter/X, Rutube, VK video |
| `Layout`, `Collapsible` | Yes | Structural nodes |
| `TextColor`, `TextBackground`, `TextFont`, `TextSize`, `ClearFormatting` | Yes | Text appearance |
| `Actions`, `ContextMenu`, `DragDropPaste`, `I18n` | Yes | Editor interactions |
| `PayloadToolbar`, `UndoRedo`, `HTMLConverter`, `GlobalStorage` | Yes | Editor infrastructure |
| `Relationship`, `Upload`, `Blocks`, `Heading`, `Paragraph`, `Link` | Yes | Locally adapted Payload default features |
| `Align`, `BlockQuote`, `BoldText`, `ItalicText`, `StrikethroughText`, `SubscriptText`, `SuperscriptText`, `UnderlineText`, `HorizontalRule`, `Indent`, `CheckList`, `OrderedList`, `UnorderedList` | Yes | Formatting and lists |
| `InlineImage` | **Not registered** | Implementation exists in source but is commented out of the aggregator |

These are not independent installable npm modules; they are configured using one field's feature map. Some individual features are exported at package root, but not all are.

## Gallery configuration

Defined in `src/features/custom/Images/ImageGallery/index.tsx`:

```ts
Gallery: {
  enabled: true,
  props: {
    collections: {
      media: {
        serverURL: 'http://localhost:3000',
        // useCustomURL: false,
      },
    },
  },
},
```

With `useCustomURL: false` (or omitted), the gallery image URL builder creates `<serverURL>/<collection>/<filename>`, e.g. `http://localhost:3000/media/photo.jpg`. With `useCustomURL: true`, it creates `<serverURL>/<filename>` instead; useful for storage/CDN setups with no collection prefix. `collections` keys must match actual Payload upload collection slugs. The original package uses special controls (layout, remove gallery/images, insert paragraphs).

### Block images

`BlockImage` uses a *different URL convention*: `<serverURL>/<filename>`. For locally served media:

```ts
BlockImage: {
  enabled: true,
  props: { serverURL: 'http://localhost:3000/media' },
},
```

`PAYLOAD_PUBLIC_SERVER_URL` is also referenced by a URL helper used by HTML conversion; check this if images show the wrong host.

## Tables, formatting, layout and embeds

Most features are enabled without extra props. The aggregator injects translation resources and other defaults. `TextFont` defaults to the `FONTS` list; `TextSize` has no custom aggregator props. Default embeds include YouTube, Twitter, Rutube and VK; external embed rendering may depend on provider URLs and behavior.

The block feature defaults to `blocks: []`. To insert your own Payload block definitions, override `Blocks` with `props: { blocks: [YourBlock] }` as in the original `test/fields/collections/LexicalPlayground/index.ts`.

## Comments (experimental)

The package exports `LexicalComments`, with slug `lexical-comments` and fields `comments` and `hash`. Its access checks are commented out. The comments field hook itself is unfinished. It is also incorrectly wired to run only when `uploadImageHook.enabled` is true. **Do not enable without implementing access control and completing the lifecycle.**

## AI assistant (experimental)

The aggregator creates `GoogleGeminiAdapter` with an empty string for its key and makes this client-side adapter part of feature props. Setting a real API key in that source code would expose it in the Admin Panel bundle. Use server-mediated authenticated API calls and leave `AIAssistant` disabled until repaired.

## Custom image upload hook (experimental)

If `uploadImageHook.enabled` is true, `richText()` attaches a `beforeChange` hook that uploads recognized remote/base64 image nodes to the configured Payload upload collection. Its implementation may delete existing files when image nodes are removed, and unrestricted remote fetching is a security risk. Keep it **disabled** on public-facing deployments until fixed.

## Public package exports

The root `src/index.ts` exports `richText`, `LexicalComments`, `theme`, `QOLFeatures` (alias for `FeaturesAggregator`), and selected feature providers / converters / hooks. See [DEVELOPMENT.md](DEVELOPMENT.md) for a complete list and source locations.
