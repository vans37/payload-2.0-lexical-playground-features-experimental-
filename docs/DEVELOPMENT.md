# Architecture, exports, and building

## Structure

```text
src/
  index.ts                         public exports
  fields/richTextLexical.ts         `richText()` Payload field wrapper
  collections/LexicalComments.ts   optional, unfinished comments collection
  features/FeauturesAggregator/    featureMap, defaults, props (historical spelling)
  features/custom/                 custom Lexical nodes, plugins, UI and converters
  features/default/                adapted upstream Payload Lexical features
  features/lib/                    styles, utilities, editor theme and UI
  globalStore/                     shared client state
```

The feature aggregator merges the enabled-by-default map with `featureProps` and calls providers in `featureMap`. It does not use the Payload 3 `createServerFeature` / `createClientFeature` API.

## Public exports in `src/index.ts`

- `richText`, `LexicalComments`, `theme`
- `QOLFeatures` (same function as `FeaturesAggregator`), `EnabledFeatures` type
- `ActionsFeature`, `AIAssistantFeature`, `CollapsibleFeature`, `CommentsFeature`, `ContextMenuFeature`, `DragDropPasteFeature`, `I18nFeature`, `LayoutFeature`
- `BlockImageFeature`, `TableActionMenuFeature`, `TableCellResizerFeature`, `PayloadToolbarFeature`, `TextBackgroundFeature`, `TextColorFeature`, `ClearFormattingFeature`, `YoutubeFeature` (alias for `EmbedFeature`)
- `linkConverter`, `paragraphConverter`, `TextHTMLConverter`, `uploadImagesHook`
- Various toolbar and image / AI types

Not every feature under `src/features/custom/` is re-exported as a top-level symbol. The safest public entry for an application is `richText()`.

## Historical build

The Payload 2 package scripts are:

```bash
pnpm build
# -> copyfiles -> swc ./src -d ./dist -> tsc --emitDeclarationOnly --outDir dist
```

The package's `tsconfig.json` extends `../../tsconfig.json` and references `../payload`. Therefore **build it under the Payload 2 workspace** or adjust these paths and dependencies in a separate branch. The compiled `1.0.2` tarball already includes `dist` and is the recommended way to test an existing v2 app.

For source development, exclude generated artifacts (`node_modules`, `dist`, `build`) from source commits; package builds produce the distributable `dist/` directory.

