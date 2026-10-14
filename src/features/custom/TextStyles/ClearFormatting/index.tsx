import { CLEAR_FORMATTING_COMMAND } from './plugin'
import { toolbarTextStylesGroupWithItems } from '../Shared'

import { $isRangeSelection, $isTextNode } from 'lexical'
import { FeatureProviderWithToolbar } from '../../../lib/types'
import { ClearFormattingIcon } from '../../../lib/ui/icons/ClearFormatting'

export const ClearFormattingFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.ClearFormattingPlugin),
            position: 'normal',
          },
        ],
        props: null,
        toolbarFixed: {
          groups: [
            toolbarTextStylesGroupWithItems([
              {
                ChildComponent: ClearFormattingIcon,
                isEnabled: ({ selection }) => {
                  if ($isRangeSelection(selection)) {
                    return true
                  }
                  return false
                },
                key: 'clear_formatting',
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(CLEAR_FORMATTING_COMMAND, true)
                  })
                },
                order: 22,
              },
            ]),
          ],
        },
        toolbarInline: {
          groups: [
            toolbarTextStylesGroupWithItems([
              {
                ChildComponent: ClearFormattingIcon,
                isEnabled: ({ selection }) => {
                  if (!$isRangeSelection(selection)) {
                    return false
                  }
                  for (const node of selection.getNodes()) {
                    if (!$isTextNode(node)) {
                      return false
                    }
                  }
                  return true
                },
                key: 'clear_formatting',
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(CLEAR_FORMATTING_COMMAND, true)
                  })
                },
                order: 22,
              },
            ]),
          ],
        },
      }
    },
    key: 'clear_formatting',
  }
}
