import { $isElementNode, $isRangeSelection, FORMAT_ELEMENT_COMMAND } from 'lexical'
import { ToolbarGroupItem, ToolbarGroup, FeatureProviderWithToolbar } from '../../lib/types'
import { AlignCenterIcon } from '../../lib/ui/icons/AlignCenter'
import { AlignJustifyIcon } from '../../lib/ui/icons/AlignJustify'
import { AlignLeftIcon } from '../../lib/ui/icons/AlignLeft'
import { AlignRightIcon } from '../../lib/ui/icons/AlignRight'
import { i18n } from './i18n'

export const toolbarAlignGroupWithItems = (items: ToolbarGroupItem[]): ToolbarGroup => {
  return {
    type: 'dropdown',
    ChildComponent: AlignLeftIcon,
    items: items,
    key: 'align',
    order: 30,
  }
}

const toolbarGroups: ToolbarGroup[] = [
  toolbarAlignGroupWithItems([
    {
      ChildComponent: AlignLeftIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if ($isElementNode(node)) {
            if (node.getFormatType() === 'left') {
              continue
            }
          }

          const parent = node.getParent()
          if ($isElementNode(parent)) {
            if (parent.getFormatType() === 'left') {
              continue
            }
          }

          return false
        }
        return true
      },
      key: 'alignLeft',
      label: ({ i18n }) => i18n.t('default_align:alignLeftLabel'),
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
      },
      order: 1,
    },
    {
      ChildComponent: AlignCenterIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if ($isElementNode(node)) {
            if (node.getFormatType() === 'center') {
              continue
            }
          }

          const parent = node.getParent()
          if ($isElementNode(parent)) {
            if (parent.getFormatType() === 'center') {
              continue
            }
          }

          return false
        }
        return true
      },
      key: 'alignCenter',
      label: ({ i18n }) => i18n.t('default_align:alignCenterLabel'),
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
      },
      order: 2,
    },
    {
      ChildComponent: AlignRightIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if ($isElementNode(node)) {
            if (node.getFormatType() === 'right') {
              continue
            }
          }

          const parent = node.getParent()
          if ($isElementNode(parent)) {
            if (parent.getFormatType() === 'right') {
              continue
            }
          }

          return false
        }
        return true
      },
      key: 'alignRight',
      label: ({ i18n }) => i18n.t('default_align:alignRightLabel'),
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
      },
      order: 3,
    },
    {
      ChildComponent: AlignJustifyIcon,
      isActive: ({ selection }) => {
        if (!$isRangeSelection(selection)) {
          return false
        }
        for (const node of selection.getNodes()) {
          if ($isElementNode(node)) {
            if (node.getFormatType() === 'justify') {
              continue
            }
          }

          const parent = node.getParent()
          if ($isElementNode(parent)) {
            if (parent.getFormatType() === 'justify') {
              continue
            }
          }

          return false
        }
        return true
      },
      key: 'alignJustify',
      label: ({ i18n }) => i18n.t('default_align:alignJustifyLabel'),
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
      },
      order: 4,
    },
  ]),
]

export const AlignFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        props: null,
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
        translation: i18n,
      }
    },
    key: 'align',
  }
}
