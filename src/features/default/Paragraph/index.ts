import { $setBlocksType } from '@lexical/selection'
import { $createParagraphNode, $getSelection, $isParagraphNode, $isRangeSelection } from 'lexical'

import { SlashMenuOption } from '@payloadcms/richtext-lexical'

import { toolbarTextDropdownGroupWithItems } from '../Shared/toolbar/textDropdownGroup'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../lib/types'
import { TextIcon } from '../../lib/ui/icons/Text'
import { i18n } from './i18n'

const toolbarGroups: ToolbarGroup[] = [
  toolbarTextDropdownGroupWithItems([
    {
      ChildComponent: TextIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if (!$isParagraphNode(node) && !$isParagraphNode(node.getParent())) {
            return false
          }
        }
        return true
      },
      key: 'paragraph',
      label: ({ i18n }) => i18n.t('default_paragraph:label'),
      onSelect: ({ editor }) => {
        editor.update(() => {
          const selection = $getSelection()
          $setBlocksType(selection, () => $createParagraphNode())
        })
      },
      order: 1,
    },
  ]),
]

export const ParagraphFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        props: null,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('default_paragraph:slash_menu_title'),
              key: 'basic',
              options: [
                new SlashMenuOption('paragraph', {
                  Icon: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/Text').then((module) => module.TextIcon),
                  displayName: ({ i18n }) => i18n.t('default_paragraph:slash_menu_label'),
                  keywords: ['normal', 'paragraph', 'p', 'text'],
                  onSelect: ({ editor }) => {
                    editor.update(() => {
                      const selection = $getSelection()
                      $setBlocksType(selection, () => $createParagraphNode())
                    })
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
    key: 'paragraph',
  }
}
