import { $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'
import { ITALIC_STAR, ITALIC_UNDERSCORE } from './markdownTransformers'

import { toolbarFormatGroupWithItems } from '../shared'
import { ToolbarGroup, FeatureProviderWithToolbar } from '../../../lib/types'
import { ItalicIcon } from '../../../lib/ui/icons/Italic'

const toolbarGroups: ToolbarGroup[] = [
  toolbarFormatGroupWithItems([
    {
      ChildComponent: ItalicIcon,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return selection.hasFormat('italic')
        }
        return false
      },
      isEnabled: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return true
        }
        return false
      },
      key: 'italic',
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
      },
      order: 2,
    },
  ]),
]

export const ItalicTextFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        markdownTransformers: [ITALIC_STAR, ITALIC_UNDERSCORE],
        props: null,
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
      }
    },
    key: 'italic',
  }
}
