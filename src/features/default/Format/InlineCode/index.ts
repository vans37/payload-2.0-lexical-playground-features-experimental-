import { $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'

import { INLINE_CODE } from './markdownTransformers'

import { toolbarFormatGroupWithItems } from '../shared'
import { ToolbarGroup, FeatureProviderWithToolbar } from '../../../lib/types'
import { CodeIcon } from '../../../lib/ui/icons/Code'

const toolbarGroups: ToolbarGroup[] = [
  toolbarFormatGroupWithItems([
    {
      ChildComponent: CodeIcon,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return selection.hasFormat('code')
        }
        return false
      },
      isEnabled: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return true
        }
        return false
      },
      key: 'inlineCode',
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
      },
      order: 7,
    },
  ]),
]

export const InlineCodeTextFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
        markdownTransformers: [INLINE_CODE],
        props: null,
      }
    },
    key: 'inlineCode',
  }
}
