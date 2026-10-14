import { EmbedMatchResult } from '@lexical/react/LexicalAutoEmbedPlugin'
import {
  HTMLConverter,
  NodeValidation,
  PopulationPromise,
  SlashMenuGroup,
} from '@payloadcms/richtext-lexical'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../../features/lib/types'
import { Resource } from '../I18n/types'
import { Klass, LexicalEditor, LexicalNode, LexicalNodeReplacement } from 'lexical'

export interface EmbedConfig<
  TEmbedMatchResultData = unknown,
  TEmbedMatchResult = EmbedMatchResult<TEmbedMatchResultData>,
> {
  type: string
  parseUrl: (text: string) => Promise<TEmbedMatchResult | null> | TEmbedMatchResult | null
  insertNode: (editor: LexicalEditor, result: TEmbedMatchResult) => void
}

export interface PlaygroundEmbedConfig extends EmbedConfig {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string

  // Icon for display.
  icon?: JSX.Element

  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string

  // For extra searching.
  keywords: Array<string>

  // Embed a Figma Project.
  description?: string
}

export type EmbedFeatureProps = {
  translation?: Resource
  embedConfigs?: PlaygroundEmbedConfig[]
  /** Register custom plugin here to support custom embeds */
  plugins?: Array<
    | {
        Component: () => Promise<
          React.FC<{
            anchorElem: HTMLElement
          }>
        >
        position: 'floatingAnchorElem'
      }
    | {
        Component: () => Promise<React.FC>
        position: 'bottom'
      }
    | {
        Component: () => Promise<React.FC>
        position: 'normal'
      }
    | {
        Component: () => Promise<React.FC>
        position: 'top'
      }
  >
  nodes?: Array<{
    converters?: {
      html?: HTMLConverter
    }
    node: Klass<LexicalNode> | LexicalNodeReplacement
    populationPromises?: Array<PopulationPromise>
    type: string
    validations?: Array<NodeValidation>
  }>
  slashMenu?: {
    dynamicOptions?: ({
      editor,
      queryString,
    }: {
      editor: LexicalEditor
      queryString: string
    }) => SlashMenuGroup[]
    options?: SlashMenuGroup[]
  }
  toolbar: {
    toolbarFixed?: {
      groups?: ToolbarGroup[]
    }
    toolbarInline?: {
      groups?: ToolbarGroup[]
    }
  }
}

export const EmbedFeature = (props: EmbedFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        slashMenu: { ...props.slashMenu },
        nodes: [...(props.nodes || [])],
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('embed')
              }),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin/AutoEmbedPlugin').then((module) => module.default),
            position: 'normal',
          },
          ...(props.plugins || []),
        ],
        props,
      }
    },
    key: 'embed',
  }
}
