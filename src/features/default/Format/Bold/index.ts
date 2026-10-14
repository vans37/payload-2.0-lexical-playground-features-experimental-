import { $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'

import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
} from './markdownTransformers'

import { toolbarFormatGroupWithItems } from '../shared'
import { ToolbarGroup, FeatureProviderWithToolbar } from '../../../lib/types'
import { BoldIcon } from '../../../lib/ui/icons/Bold'

const toolbarGroups: ToolbarGroup[] = [
  toolbarFormatGroupWithItems([
    {
      ChildComponent: BoldIcon,
      isActive: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return selection.hasFormat('bold')
        }
        return false
      },
      isEnabled: ({ selection }) => {
        if ($isRangeSelection(selection)) {
          return true
        }
        return false
      },
      key: 'bold',
      onSelect: ({ editor }) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
      },
      order: 1,
    },
  ]),
]

export const BoldTextFeature = (): FeatureProviderWithToolbar => {
  return {
    dependenciesSoft: ['italic'],
    feature: ({ featureProviderMap }) => {
      const markdownTransformers = [BOLD_STAR, BOLD_UNDERSCORE]
      if (featureProviderMap.get('italic')) {
        markdownTransformers.push(BOLD_ITALIC_UNDERSCORE, BOLD_ITALIC_STAR)
      }

      return {
        toolbarFixed: {
          groups: toolbarGroups,
        },
        toolbarInline: {
          groups: toolbarGroups,
        },
        markdownTransformers: markdownTransformers,
        props: null,
      }
    },
    key: 'bold',
  }
}
