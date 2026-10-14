import type { SerializedQuoteNode } from '@lexical/rich-text'

import { $createQuoteNode, $isQuoteNode, QuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $getSelection, $isRangeSelection } from 'lexical'

import type { HTMLConverter } from '../converters/html/converter/types'

import { convertLexicalNodesToHTML } from '../converters/html/converter'
import { MarkdownTransformer } from './markdownTransformer'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'

import { toolbarTextDropdownGroupWithItems } from '../../custom/PayloadToolbars/plugin/textDropdownGroup'
import { ToolbarGroup, FeatureProviderWithToolbar } from '../../lib/types'
import { BlockquoteIcon } from '../../lib/ui/icons/Blockquote'
import { i18n } from './i18n'

const toolbarGroups: ToolbarGroup[] = [
  toolbarTextDropdownGroupWithItems([
    {
      ChildComponent: BlockquoteIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if (!$isQuoteNode(node) && !$isQuoteNode(node.getParent())) {
            return false
          }
        }
        return true
      },
      key: 'blockquote',
      label: ({ i18n }) => i18n.t('default_blockquote:label'),
      onSelect: ({ editor }) => {
        editor.update(() => {
          const selection = $getSelection()
          $setBlocksType(selection, () => $createQuoteNode())
        })
      },
      order: 20,
    },
  ]),
]

export const BlockQuoteFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        markdownTransformers: [MarkdownTransformer],
        nodes: [
          {
            type: QuoteNode.getType(),
            converters: {
              html: {
                converter: async ({ converters, node, parent }) => {
                  const childrenText = await convertLexicalNodesToHTML({
                    converters,
                    lexicalNodes: node.children,
                    parent: {
                      ...node,
                      parent,
                    },
                  })

                  return `<blockquote>${childrenText}</blockquote>`
                },
                nodeTypes: [QuoteNode.getType()],
              } as HTMLConverter<SerializedQuoteNode>,
            },
            node: QuoteNode,
          },
        ],
        props: null,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('default_blockquote:slash_menu_title'),
              key: 'basic',
              options: [
                new SlashMenuOption(`blockquote`, {
                  Icon: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/Blockquote').then((module) => module.BlockquoteIcon),
                  displayName: ({ i18n }) => i18n.t('default_blockquote:slash_menu_label'),
                  keywords: ['quote', 'blockquote'],
                  onSelect: () => {
                    const selection = $getSelection()
                    $setBlocksType(selection, () => $createQuoteNode())
                  },
                }),
              ],
            },
          ],
        },
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
        translation: i18n,
      }
    },
    key: 'blockquote',
  }
}
