import { OPEN_COLOR_PICKER_COMMAND } from './plugin'

import { toolbarTextStylesGroupWithItems } from '../Shared'
import { $isRangeSelection, $isTextNode, $getSelection } from 'lexical'
import { FeatureProviderWithToolbar } from '../../../lib/types'
import { BackgroundColorIcon } from '../../../lib/ui/icons/BackgroundColor'
import { $getSelectionStyleValueForProperty } from '@lexical/selection'

export type TextBackgroundFeatureProps = {
  /** #RRGGBBAA */
  predefinedColors: string[]
}

export const TextBackgroundFeature = (
  props: TextBackgroundFeatureProps,
): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.TextStylesPlugin),
            position: 'normal',
          },
        ],
        props,
        toolbarFixed: {
          groups: [
            toolbarTextStylesGroupWithItems([
              {
                ChildComponent: BackgroundColorIcon,
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
                isActive: ({ selection }) => {
                  if (!$isRangeSelection(selection)) {
                    return false
                  }
                  for (const node of selection.getNodes()) {
                    if ($isTextNode(node)) {
                      const style = $getSelectionStyleValueForProperty(
                        selection,
                        'background-color',
                      )
                      if (style) {
                        return true
                      }
                    }
                  }
                  return false
                },
                key: 'background_color',
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    const selection = $getSelection()
                    if ($isRangeSelection(selection)) {
                      const bgColor = $getSelectionStyleValueForProperty(
                        selection,
                        'background-color',
                      )
                      if (bgColor) {
                        editor.dispatchCommand(OPEN_COLOR_PICKER_COMMAND, { color: bgColor })
                      } else {
                        editor.dispatchCommand(OPEN_COLOR_PICKER_COMMAND, { color: '#000000FF' })
                      }
                    }
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
                ChildComponent: BackgroundColorIcon,
                isEnabled: ({ selection }) => {
                  if ($isRangeSelection(selection)) {
                    return true
                  }
                  return false
                },
                isActive: ({ selection }) => {
                  if (!$isRangeSelection(selection)) {
                    return false
                  }
                  for (const node of selection.getNodes()) {
                    if ($isTextNode(node)) {
                      const style = $getSelectionStyleValueForProperty(
                        selection,
                        'background-color',
                      )
                      if (style) {
                        return true
                      }
                    }
                  }
                  return false
                },
                key: 'background_color',
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    const selection = $getSelection()
                    if ($isRangeSelection(selection)) {
                      const bgColor = $getSelectionStyleValueForProperty(
                        selection,
                        'background-color',
                      )
                      if (bgColor) {
                        editor.dispatchCommand(OPEN_COLOR_PICKER_COMMAND, { color: bgColor })
                      } else {
                        editor.dispatchCommand(OPEN_COLOR_PICKER_COMMAND, { color: '#000000FF' })
                      }
                    }
                  })
                },
                order: 22,
              },
            ]),
          ],
        },
      }
    },
    key: 'text_background',
  }
}
