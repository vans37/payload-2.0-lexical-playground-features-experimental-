import { $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'
import { toolbarFormatGroupWithItems } from '../shared'
import { FeatureProviderWithToolbar, ToolbarGroup } from '../../../lib/types'
import { SubscriptIcon } from '../../../lib/ui/icons/Subscript'

const toolbarGroups: ToolbarGroup[] = [
  toolbarFormatGroupWithItems([
    {
      ChildComponent: SubscriptIcon,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return selection.hasFormat('subscript')
        }
        return false
      },
      isEnabled: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return true
        }
        return false
      },
      key: 'subscript',
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
      },
      order: 5,
    },
  ]),
]

export const SubscriptTextFeature = (): FeatureProviderWithToolbar => {
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
    key: 'subscript',
  }
}
