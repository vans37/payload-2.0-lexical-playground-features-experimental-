import {
  FeatureProvider,
  HTMLConverterFeature,
  HTMLConverterFeatureProps,
  TextHTMLConverter,
  useEditorConfigContext,
} from '@payloadcms/richtext-lexical'

import galleryProps from './props/gallery'
import '../lib/index.scss'
import imageFeatureProps from './props/images'
import { I18nFeature } from '../custom/I18n'
import { AIAssistantFeature, AIAssistantFeatureProps } from '../custom/AI'

import { ActionFeatureProps, ActionsFeature } from '../custom/Actions'
import { CollapsibleFeature, CollapsibleFeatureProps } from '../custom/Collapsible'
import { ContextMenuFeature } from '../custom/ContextMenu'
import { DragDropPasteFeature } from '../custom/DragDropPaste'
import { LayoutFeature, LayoutFeatureProps } from '../custom/Layout'
import { paragraphConverter } from '../custom/Paragraph/converter'
import { PayloadToolbarFeature } from '../custom/PayloadToolbars'
import { TableFeature, TableFeatureProps } from '../custom/Table'
import { TableActionMenuFeature, TableActionMenuProps } from '../custom/TableActionMenu'
import { TableCellResizerFeature } from '../custom/TableCellResizer'
import { TableHoverActionsFeature } from '../custom/TableHoverActions'
import {
  TextBackgroundFeature,
  TextBackgroundFeatureProps,
} from '../custom/TextStyles/BackgroundColor'
import { ClearFormattingFeature } from '../custom/TextStyles/ClearFormatting'
import { TextColorFeature, TextColorFeatureProps } from '../custom/TextStyles/TextColor'
import { UndoRedoFeature } from '../custom/UndoRedo'
import { EmbedFeature, EmbedFeatureProps } from '../custom/Embed'
import { TextSizeFeature } from '../custom/TextStyles/FontSize'
import { TextFontFeature, TextFontFeatureProps } from '../custom/TextStyles/Font'
import { FONTS } from './props/text_fonts'

import actionsProps from './props/actions'
import aiAssistantProps from './props/ai'
import collapsibleProps from './props/collapsible'
import layoutProps from './props/layout'
//import inlineImageProps from './props/inlineImage'
import tableProps from './props/table'
import tableActionMenuProps from './props/tableActionMenu'
import { RelationshipFeature, RelationshipFeatureProps } from '../default/Relationship'
import relationshipProps from './props/default/relationship'
import { UploadFeature, UploadFeatureProps } from '../default/Upload'
import defaultUploadProps from './props/default/upload'
import { AlignFeature } from '../default/Align'
import { BlockQuoteFeature } from '../default/BlockQuote'
import { BoldTextFeature } from '../default/Format/Bold'
import { ItalicTextFeature } from '../default/Format/Italic'
import { StrikethroughTextFeature } from '../default/Format/strikethrough'
import { SubscriptTextFeature } from '../default/Format/subscript'
import { SuperscriptTextFeature } from '../default/Format/superscript'
import { UnderlineTextFeature } from '../default/Format/underline'

import headingFeatureProps from './props/default/heading'
import { HorizontalRuleFeature } from '../default/Horizontalrule'
import { IndentFeature } from '../default/Indent'
import { LinkFeature, LinkFeatureProps } from '../default/Link'
import linkFeatureProps from './props/default/link'
import { CheckListFeature } from '../default/Lists/CheckList'
import { OrderedListFeature } from '../default/Lists/OrderedList'
import { UnorderedListFeature } from '../default/Lists/UnorderedList'
import { ParagraphFeature } from '../default/Paragraph'
import { BlocksFeature, BlocksFeatureProps } from '../default/Blocks'
import blockFeatureProps from './props/default/blocks'
import deepMerge from '../lib/utils/deepMerge'
import embedFeatureProps from './props/embed'
import { HeadingFeature, HeadingFeatureProps } from '../default/Heading'
import textBackgroundColorProps from './props/textStyles/backgroundColor'
import textColorProps from './props/textStyles/textColor'
import { CommentsFeature, CommentsFeatureProps } from '../custom/Comments'
import commentsProps from './props/comments'
import { BlockImageFeature, BlockImageFeatureProps } from '../custom/Images/BlockImage'
import { GalleryFeature, GalleryFeatureProps } from '../custom/Images/ImageGallery'
//import { InlineImageFeatureProps, InlineImageFeature } from '../custom/Images/InlineImage'
import { GlobalStorageFeature } from '../custom/Storage'

export type EnabledFeatures = {
  [key in Features]?: {
    enabled: boolean
    props?: FeatureProps<key>
  }
}

export const featureMap = {
  Comments: (props: CommentsFeatureProps) => CommentsFeature(props),
  I18n: () => I18nFeature(),
  AIAssistant: (props: AIAssistantFeatureProps) => AIAssistantFeature(props),
  Actions: (props: ActionFeatureProps) => ActionsFeature(props),
  ContextMenu: () => ContextMenuFeature(),
  DragDropPaste: () => DragDropPasteFeature(),
  TableCellResizer: () => TableCellResizerFeature(),
  Table: (props: TableFeatureProps) => TableFeature(props),
  TableActionMenu: (props: TableActionMenuProps) => TableActionMenuFeature(props),
  TableHoverActions: () => TableHoverActionsFeature(),
  BlockImage: (props: BlockImageFeatureProps) => BlockImageFeature(props),
  // InlineImage: (props: InlineImageFeatureProps) => InlineImageFeature(props),
  Gallery: (props: GalleryFeatureProps) => GalleryFeature(props),
  Embed: (props: EmbedFeatureProps) => EmbedFeature(props),
  Layout: (props: LayoutFeatureProps) => LayoutFeature(props),
  TextBackground: (props: TextBackgroundFeatureProps) => TextBackgroundFeature(props),
  TextColor: (props: TextColorFeatureProps) => TextColorFeature(props),
  TextFont: (props: TextFontFeatureProps) => TextFontFeature(props),
  TextSize: () => TextSizeFeature(),
  ClearFormatting: () => ClearFormattingFeature(),
  Collapsible: (props: CollapsibleFeatureProps) => CollapsibleFeature(props),
  HTMLConverter: (props: HTMLConverterFeatureProps) => HTMLConverterFeature(props),
  PayloadToolbar: () => PayloadToolbarFeature(),
  UndoRedo: () => UndoRedoFeature(),
  Relationship: (props: RelationshipFeatureProps) => RelationshipFeature(props),
  Upload: (props: UploadFeatureProps) => UploadFeature(props),
  Align: () => AlignFeature(),
  BlockQuote: () => BlockQuoteFeature(),
  BoldText: () => BoldTextFeature(),
  ItalicText: () => ItalicTextFeature(),
  StrikethroughText: () => StrikethroughTextFeature(),
  SubscriptText: () => SubscriptTextFeature(),
  SuperscriptText: () => SuperscriptTextFeature(),
  UnderlineText: () => UnderlineTextFeature(),
  Heading: (props: HeadingFeatureProps) => HeadingFeature(props),
  HorizontalRule: () => HorizontalRuleFeature(),
  Indent: () => IndentFeature(),
  Link: (props: LinkFeatureProps) => LinkFeature(props),
  CheckList: () => CheckListFeature(),
  OrderedList: () => OrderedListFeature(),
  UnorderedList: () => UnorderedListFeature(),
  Paragraph: () => ParagraphFeature(),
  Blocks: (props: BlocksFeatureProps) => BlocksFeature(props),
  GlobalStorage: () => GlobalStorageFeature(),
} as const

export type Features = keyof typeof featureMap

export type FeatureProps<T extends Features> = Parameters<(typeof featureMap)[T]>[0]

const defaultFeatures: EnabledFeatures = {
  Relationship: {
    enabled: true,
    props: relationshipProps,
  },
  Upload: {
    enabled: true,
    props: defaultUploadProps,
  },
  Align: {
    enabled: true,
    props: null,
  },
  BlockQuote: {
    enabled: true,
    props: null,
  },
  BoldText: {
    enabled: true,
    props: null,
  },
  ItalicText: {
    enabled: true,
    props: null,
  },
  StrikethroughText: {
    enabled: true,
    props: null,
  },
  SubscriptText: {
    enabled: true,
    props: null,
  },
  SuperscriptText: {
    enabled: true,
    props: null,
  },
  UnderlineText: {
    enabled: true,
    props: null,
  },
  Heading: {
    enabled: true,
    props: headingFeatureProps,
  },
  HorizontalRule: {
    enabled: true,
    props: null,
  },
  Indent: {
    enabled: true,
    props: null,
  },
  Link: {
    enabled: true,
    props: linkFeatureProps,
  },
  CheckList: {
    enabled: true,
    props: null,
  },
  OrderedList: {
    enabled: true,
    props: null,
  },
  UnorderedList: {
    enabled: true,
    props: null,
  },
  Paragraph: {
    enabled: true,
    props: null,
  },
  Blocks: {
    enabled: true,
    props: blockFeatureProps,
  },
  GlobalStorage: {
    enabled: true,
  },
}

const enabledFeaturesByDefault: EnabledFeatures = {
  Comments: {
    enabled: true,
    props: commentsProps,
  },
  I18n: {
    enabled: true,
    props: null,
  },
  AIAssistant: {
    enabled: true,
    props: aiAssistantProps,
  },
  Actions: {
    enabled: true,
    props: actionsProps,
  },
  ContextMenu: {
    enabled: true,
    props: null,
  },
  DragDropPaste: {
    enabled: true,
    props: null,
  },
  Table: {
    enabled: true,
    props: tableProps,
  },
  TableActionMenu: {
    enabled: true,
    props: tableActionMenuProps,
  },
  TableCellResizer: {
    enabled: true,
    props: null,
  },
  TableHoverActions: {
    enabled: true,
    props: null,
  },
  BlockImage: {
    enabled: true,
    props: imageFeatureProps,
  },
  // InlineImage: {
  //   enabled: true,
  //   props: inlineImageProps,
  // },
  Gallery: {
    enabled: true,
    props: galleryProps,
  },
  Embed: {
    enabled: true,
    props: embedFeatureProps,
  },
  Layout: {
    enabled: true,
    props: layoutProps,
  },
  TextSize: {
    enabled: true,
    props: null,
  },
  TextBackground: {
    enabled: true,
    props: textBackgroundColorProps,
  },
  TextColor: {
    enabled: true,
    props: textColorProps,
  },
  TextFont: {
    enabled: true,
    props: {
      fonts: FONTS,
    },
  },
  ClearFormatting: {
    enabled: true,
    props: null,
  },
  Collapsible: {
    enabled: true,
    props: collapsibleProps,
  },
  HTMLConverter: {
    enabled: true,
    props: {
      converters: ({ defaultConverters }) => {
        const filtered = defaultConverters.filter((converter) => {
          return !converter.nodeTypes.includes('text') && !converter.nodeTypes.includes('paragraph')
        })
        return [...filtered, paragraphConverter, TextHTMLConverter]
      },
    },
  },
  PayloadToolbar: {
    enabled: true,
    props: null,
  },
  UndoRedo: {
    enabled: true,
    props: null,
  },
  ...defaultFeatures,
}

export const FeaturesAggregator = (
  enabledFeatures: EnabledFeatures = enabledFeaturesByDefault,
): FeatureProvider[] => {
  const enabled: FeatureProvider[] = []
  const merged = deepMerge(enabledFeaturesByDefault, enabledFeatures)

  for (const [key, value] of Object.entries(merged) as [Features, EnabledFeatures[Features]][]) {
    if (value?.enabled && featureMap[key]) {
      //@ts-ignore
      enabled.push(featureMap[key](value.props as any))
    }
  }

  return enabled
}
