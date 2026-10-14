import { $isListNode, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list'

import { ListHTMLConverter, ListItemHTMLConverter } from '../htmlConverter'
import { UNORDERED_LIST } from './markdownTransformer'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'

import { toolbarTextDropdownGroupWithItems } from '../../Shared/toolbar/textDropdownGroup'
import { $isRangeSelection } from 'lexical'

import { FeatureProviderWithToolbar, ToolbarGroup } from '../../../lib/types'
import { UnorderedListIcon } from '../../../lib/ui/icons/UnorderedList'
import { i18n } from './i18n'

const toolbarGroups: ToolbarGroup[] = [
  toolbarTextDropdownGroupWithItems([
    {
      ChildComponent: UnorderedListIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if ($isListNode(node) && node.getListType() === 'bullet') {
            continue
          }

          const parent = node.getParent()

          if ($isListNode(parent) && parent.getListType() === 'bullet') {
            continue
          }

          const parentParent = parent?.getParent()
          // Example scenario: Node = textNode, parent = listItemNode, parentParent = listNode
          if ($isListNode(parentParent) && parentParent.getListType() === 'bullet') {
            continue
          }

          return false
        }
        return true
      },
      key: 'unorderedList',
      label: ({ i18n }) => i18n.t('default_unorderedlist:label'),
      onSelect: ({ editor }) => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      },
      order: 11,
    },
  ]),
]

export const UnorderedListFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        markdownTransformers: [UNORDERED_LIST],
        nodes: [
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
        plugins: [
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
              displayName: ({ i18n }) => i18n.t('default_unorderedlist:slash_menu_title'),
              key: 'lists',
              options: [
                new SlashMenuOption('unorderedlist', {
                  Icon: () =>
                    // @ts-expect-error
                    import('../../../lib/ui/icons/UnorderedList').then(
                      (module) => module.UnorderedListIcon,
                    ),
                  displayName: ({ i18n }) => i18n.t('default_unorderedlist:slash_menu_label'),
                  keywords: ['unordered list', 'ul'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
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
    key: 'unorderedList',
  }
}
