import { $isListNode, INSERT_ORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list'

import { ListHTMLConverter, ListItemHTMLConverter } from '../htmlConverter'
import { ORDERED_LIST } from './markdownTransformer'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'

import { toolbarTextDropdownGroupWithItems } from '../../Shared/toolbar/textDropdownGroup'

import { $isRangeSelection } from 'lexical'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../../lib/types'
import { OrderedListIcon } from '../../../lib/ui/icons/OrderedList'
import { i18n } from './i18n'

const toolbarGroups: ToolbarGroup[] = [
  toolbarTextDropdownGroupWithItems([
    {
      ChildComponent: OrderedListIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if ($isListNode(node) && node.getListType() === 'number') {
            continue
          }

          const parent = node.getParent()

          if ($isListNode(parent) && parent.getListType() === 'number') {
            continue
          }

          const parentParent = parent?.getParent()
          // Example scenario: Node = textNode, parent = listItemNode, parentParent = listNode
          if ($isListNode(parentParent) && parentParent.getListType() === 'number') {
            continue
          }

          return false
        }
        return true
      },
      key: 'orderedList',
      label: ({ i18n }) => i18n.t('default_orderedlist:label'),
      onSelect: ({ editor }) => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      },
      order: 10,
    },
  ]),
]

export const OrderedListFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: ({ featureProviderMap }) => {
      return {
        markdownTransformers: [ORDERED_LIST],
        nodes: featureProviderMap.has('unorderedList')
          ? []
          : [
              {
                converters: {
                  html: ListHTMLConverter,
                },
                node: ListNode,
                type: ListNode.getType(),
              },
              {
                converters: {
                  html: ListItemHTMLConverter,
                },
                node: ListItemNode,
                type: ListItemNode.getType(),
              },
            ],
        plugins: featureProviderMap.has('unorderedList')
          ? []
          : [
              {
                Component: () =>
                  // @ts-expect-error
                  import('../plugin').then((module) => module.LexicalListPlugin),
                position: 'normal',
              },
            ],
        props: null,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('default_orderedlist:slash_menu_title'),
              key: 'lists',
              options: [
                new SlashMenuOption('orderedlist', {
                  Icon: () =>
                    // @ts-expect-error
                    import('../../../lib/ui/icons/OrderedList').then(
                      (module) => module.OrderedListIcon,
                    ),
                  displayName: ({ i18n }) => i18n.t('default_orderedlist:slash_menu_label'),
                  keywords: ['ordered list', 'ol'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
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
    key: 'orderedList',
  }
}
