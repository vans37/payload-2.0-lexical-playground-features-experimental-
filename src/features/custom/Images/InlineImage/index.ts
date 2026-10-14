import { toolbarAddDropdownGroupWithItems } from '../../../default/Shared/toolbar/addDropdownGroup'
import { FeatureProviderWithToolbar } from '../../../lib/types'
import { InlineImageIcon } from '../../../lib/ui/icons/InlineImage'
import { Resource } from '../../I18n/types'
import { InlineImageNode } from './nodes/InlineImageNode'

import { TOGGLE_UPLOADS_DRAWER_COMMAND } from './plugin'

export type InlineImageFeatureProps = {
  origin: string
  uploadCollectionSlug: string
  translation?: Resource
}

export const InlineImageFeature = (props: InlineImageFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: InlineImageNode.getType(),
            // converters: {
            //   html: ImagesConverter,
            // },
            node: InlineImageNode,
          },
        ],
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('inline_images')
              }),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.default),
            position: 'normal',
          },
        ],
        props,
        toolbarFixed: {
          groups: [
            toolbarAddDropdownGroupWithItems([
              {
                ChildComponent: InlineImageIcon,
                isActive: ({ selection }) => {
                  // if (!$isRangeSelection(selection)) {
                  //   return false
                  // }
                  // for (const node of selection.getNodes()) {
                  //   if (!$isQuoteNode(node) && !$isQuoteNode(node.getParent())) {
                  //     return false
                  //   }
                  // }
                  return false
                },
                isEnabled: () => true,
                key: 'inline image',
                label: ({ i18n }) => i18n.t('inline_image:label'),
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(TOGGLE_UPLOADS_DRAWER_COMMAND, null)
                  })
                },
                order: 21,
              },
            ]),
          ],
        },
      }
    },
    key: 'inline_images',
  }
}
