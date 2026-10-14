export { richText } from './fields/richTextLexical'
export { LexicalComments } from './collections/LexicalComments'

export type {
  FeatureToolbar as FeatureWithToolbar,
  FeatureProviderWithToolbar as FeatureProviderWithToolbar,
  ToolbarGroup,
  ToolbarDropdownGroup,
  ToolbarButtonsGroup,
  ToolbarGroupItem,
} from './features/lib/types'

export { theme } from './features/lib/LexicalEditorTheme'
export { ActionsFeature } from './features/custom/Actions'
export { AIAssistantFeature, type AIAssistantFeatureProps } from './features/custom/AI'
export { CollapsibleFeature } from './features/custom/Collapsible'
export { CommentsFeature } from './features/custom/Comments'
export { ContextMenuFeature } from './features/custom/ContextMenu'
export { DragDropPasteFeature } from './features/custom/DragDropPaste'
export { I18nFeature } from './features/custom/I18n'
export {
  BlockImageFeature,
  type BlockImageFeatureProps as ImagesFeatureProps,
} from './features/custom/Images/BlockImage'
export { LayoutFeature } from './features/custom/Layout'
export { linkConverter } from './features/custom/Link/converter'
export { paragraphConverter } from './features/custom/Paragraph/converter'
export {
  FeaturesAggregator as QOLFeatures,
  type EnabledFeatures,
} from './features/FeauturesAggregator'
export { TableActionMenuFeature } from './features/custom/TableActionMenu'
export { TableCellResizerFeature } from './features/custom/TableCellResizer'
export { TextHTMLConverter } from './features/custom/Text/converter'
export { TextBackgroundFeature } from './features/custom/TextStyles/BackgroundColor'
export { TextColorFeature } from './features/custom/TextStyles/TextColor'
export { ClearFormattingFeature } from './features/custom/TextStyles/ClearFormatting'
export { PayloadToolbarFeature } from './features/custom/PayloadToolbars'
export { uploadImagesHook } from './features/custom/UploadImages/fieldHook'
export { EmbedFeature as YoutubeFeature } from './features/custom/Embed'
