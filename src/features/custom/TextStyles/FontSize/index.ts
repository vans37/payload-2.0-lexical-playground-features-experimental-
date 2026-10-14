import { toolbarTextStylesGroupWithItems } from '../Shared'

import { $isRangeSelection } from 'lexical'
import { FeatureProviderWithToolbar } from '../../../lib/types'
import { TextSizeToolbarComponent } from './plugin'

export const TextSizeFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        props: null,
        toolbarFixed: {
          groups: [
            toolbarTextStylesGroupWithItems([
              {
                Component: TextSizeToolbarComponent,
                isEnabled: ({ selection }) => {
                  if ($isRangeSelection(selection)) {
                    return true
                  }
                  return false
                },
                key: 'text_size',
                order: 22,
              },
            ]),
          ],
        },
      }
    },
    key: 'font_size',
  }
}
