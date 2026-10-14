import { $isListNode, INSERT_CHECK_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list'

import { ListHTMLConverter, ListItemHTMLConverter } from '../htmlConverter'
import { CHECK_LIST } from './markdownTransformers'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'

import { toolbarTextDropdownGroupWithItems } from '../../Shared/toolbar/textDropdownGroup'

import { $isRangeSelection } from 'lexical'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../../lib/types'
import { ChecklistIcon } from '../../../lib/ui/icons/Checklist'
import { i18n } from './i18n'

const toolbarGroups: ToolbarGroup[] = [
  toolbarTextDropdownGroupWithItems([
    {
      ChildComponent: ChecklistIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if ($isListNode(node) && node.getListType() === 'check') {
            continue
          }

          const parent = node.getParent()

          if ($isListNode(parent) && parent.getListType() === 'check') {
            continue
          }

          const parentParent = parent?.getParent()
          // Example scenario: Node = textNode, parent = listItemNode, parentParent = listNode
          if ($isListNode(parentParent) && parentParent.getListType() === 'check') {
            continue
          }

          return false
        }
        return true
      },
      key: 'checklist',
      label: ({ i18n }) => i18n.t('default_checklist:label'),
      onSelect: ({ editor }) => {
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
      },
      order: 12,
    },
  ]),
]

export const CheckListFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: ({ featureProviderMap }) => {
      return {
        markdownTransformers: [CHECK_LIST],
        nodes:
          featureProviderMap.has('unorderedList') || featureProviderMap.has('orderedList')
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
        plugins: [
          {
            Component: () =>
              // @ts-expect-error
              import('./plugin').then((module) => module.LexicalCheckListPlugin),
            position: 'normal',
          },
        ],
        props: null,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('default_checklist:slash_menu_title'),
              key: 'lists',
              options: [
                new SlashMenuOption('checklist', {
                  Icon: () =>
                    // @ts-expect-error
                    import('../../../lib/ui/icons/Checklist').then(
                      (module) => module.ChecklistIcon,
                    ),
                  displayName: ({ i18n }) => i18n.t('default_checklist:slash_menu_label'),
                  keywords: ['check list', 'check', 'checklist', 'cl'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
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
    key: 'checkList',
  }
}
