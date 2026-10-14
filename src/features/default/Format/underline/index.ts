import { $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'

import { toolbarFormatGroupWithItems } from '../shared'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../../lib/types'
import { UnderlineIcon } from '../../../lib/ui/icons/Underline'

const toolbarGroups: ToolbarGroup[] = [
  toolbarFormatGroupWithItems([
    {
      ChildComponent: UnderlineIcon,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return selection.hasFormat('underline')
        }
        return false
      },
      isEnabled: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return true
        }
        return false
      },
      key: 'underline',
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
      },
      order: 3,
    },
  ]),
]

export const UnderlineTextFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
        props: null,
      }
    },
    key: 'underline',
  }
}
