import { $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'
import { STRIKETHROUGH } from './markdownTransformers'
import { toolbarFormatGroupWithItems } from '../shared'
import { StrikethroughIcon } from '../../../lib/ui/icons/Strikethrough'
import { FeatureProviderWithToolbar } from '../../../lib/types'

const toolbarGroups = [
  toolbarFormatGroupWithItems([
    {
      ChildComponent: StrikethroughIcon,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return selection.hasFormat('strikethrough')
        }
        return false
      },
      isEnabled: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return true
        }
        return false
      },
      key: 'strikethrough',
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
      },
      order: 4,
    },
  ]),
]

export const StrikethroughTextFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        markdownTransformers: [STRIKETHROUGH],
        props: null,
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
      }
    },
    key: 'strikethrough',
  }
}
