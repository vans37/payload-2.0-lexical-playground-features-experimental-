import { $isRangeSelection } from 'lexical'
import { TextIcon } from '../../../lib/ui/icons/Text'
import { FeatureProviderWithToolbar } from '../../../lib/types'
import { FontPlugin } from './plugin'

export type TextFontFeatureProps = {
  fonts: string[]
}

const DEFAULT_FONTS = [
  'Arial',
  'Courier New',
  'Georgia',
  'Times New Romant',
  'Trebuchet MS',
  'Verdana',
]

export const TextFontFeature = (
  props: TextFontFeatureProps = {
    fonts: DEFAULT_FONTS,
  },
): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        props: null,
        toolbarFixed: {
          groups: [
            {
              ChildComponent: TextIcon,
              key: 'text_font',
              type: 'dropdown',
              order: 10,
              isEnabled: ({ selection }) => {
                if (!$isRangeSelection(selection)) {
                  return false
                }
                return true
              },
              items: props.fonts.map((option, id) => {
                return {
                  Component: (props) => FontPlugin({ font: option, ...props }),
                  key: `option_${id}`,
                  order: id,
                  isEnabled: ({ selection }) => {
                    if (!$isRangeSelection(selection)) {
                      return false
                    }
                    return true
                  },
                }
              }),
            },
          ],
        },
      }
    },
    key: 'text_font_feature',
  }
}
