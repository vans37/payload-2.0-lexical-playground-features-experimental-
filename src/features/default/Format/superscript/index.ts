import { $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'

import { toolbarFormatGroupWithItems } from '../shared'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../../lib/types'
import { SuperscriptIcon } from '../../../lib/ui/icons/Superscript'

const toolbarGroups: ToolbarGroup[] = [
  toolbarFormatGroupWithItems([
    {
      ChildComponent: SuperscriptIcon,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return selection.hasFormat('superscript')
        }
        return false
      },
      isEnabled: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return true
        }
        return false
      },
      key: 'superscript',
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')
      },
      order: 6,
    },
  ]),
]

export const SuperscriptTextFeature = (): FeatureProviderWithToolbar => {
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
    key: 'superscript',
  }
}
