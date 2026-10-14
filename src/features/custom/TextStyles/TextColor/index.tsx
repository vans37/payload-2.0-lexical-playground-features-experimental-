import { OPEN_COLOR_PICKER_COMMAND } from './plugin'
import { FeatureProviderWithToolbar } from '../../../../features/lib/types'
import { toolbarTextStylesGroupWithItems } from '../Shared'
import { FontColorIcon } from '../../../../features/lib/ui/icons/FontColor'
import { $getSelection, $isRangeSelection, $isTextNode } from 'lexical'
import { $getSelectionStyleValueForProperty } from '@lexical/selection'

export type TextColorFeatureProps = {
  /** #RRGGBBAA */
  predefinedColors: string[]
}

export const TextColorFeature = (props: TextColorFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.TextColorPlugin),
            position: 'normal',
          },
        ],
        props,
        toolbarFixed: {
          groups: [
            toolbarTextStylesGroupWithItems([
              {
                ChildComponent: FontColorIcon,
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
                      const style = $getSelectionStyleValueForProperty(selection, 'color')
                      if (style) {
                        return true
                      }
                    }
                  }
                  return false
                },
                key: 'text_color',
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    const selection = $getSelection()
                    if ($isRangeSelection(selection)) {
                      const textColor = $getSelectionStyleValueForProperty(selection, 'color')
                      if (textColor) {
                        editor.dispatchCommand(OPEN_COLOR_PICKER_COMMAND, { color: textColor })
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
                ChildComponent: FontColorIcon,
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
                      const style = $getSelectionStyleValueForProperty(selection, 'color')
                      if (style) {
                        return true
                      }
                    }
                  }
                  return false
                },
                key: 'text_color',
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    const selection = $getSelection()
                    if ($isRangeSelection(selection)) {
                      const textColor = $getSelectionStyleValueForProperty(selection, 'color')
                      if (textColor) {
                        editor.dispatchCommand(OPEN_COLOR_PICKER_COMMAND, { color: textColor })
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
    key: 'text_color',
  }
}
