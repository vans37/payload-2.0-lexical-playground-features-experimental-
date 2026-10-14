import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { CollapsibleContainerNode } from './nodes/CollapsibleContainerNode'
import { CollapsibleContentNode } from './nodes/CollapsibleContentNode'
import { CollapsibleTitleNode } from './nodes/CollapsibleTitleNode'
import { INSERT_COLLAPSIBLE_COMMAND } from './plugin'
import {
  CollapsibleContainerConverter,
  CollapsibleContentConverter,
  CollapsibleTitleConverter,
} from './converters'

import { toolbarAddDropdownGroupWithItems } from '../../default/Shared/toolbar/addDropdownGroup'
import { $isRangeSelection } from 'lexical'
import { FeatureProviderWithToolbar } from '../../lib/types'
import { CollapsibleIcon } from '../../lib/ui/icons/Collapsible'
import { Resource } from '../I18n/types'

export type CollapsibleFeatureProps = {
  translation?: Resource
}

export const CollapsibleFeature = (props: CollapsibleFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('collapsible:slash_menu_title'),
              key: 'custom',
              options: [
                new SlashMenuOption('Collapsible', {
                  Icon: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/Collapsible').then(
                      (module) => module.CollapsibleIcon,
                    ),
                  displayName: ({ i18n }) => i18n.t('collapsible:slash_menu_label'),
                  keywords: ['collapsible', 'container', 'hide'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)
                  },
                }),
              ],
            },
          ],
        },
        nodes: [
          {
            type: CollapsibleContainerNode.getType(),
            node: CollapsibleContainerNode,
            converters: {
              html: CollapsibleContainerConverter,
            },
          },
          {
            type: CollapsibleContentNode.getType(),
            node: CollapsibleContentNode,
            converters: {
              html: CollapsibleContentConverter,
            },
          },
          {
            type: CollapsibleTitleNode.getType(),
            node: CollapsibleTitleNode,
            converters: {
              html: CollapsibleTitleConverter,
            },
          },
        ],
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('collapsible')
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
                ChildComponent: CollapsibleIcon,
                isEnabled: ({ selection }) => {
                  if (!$isRangeSelection(selection)) {
                    return false
                  }
                  return true
                },
                key: 'collapsible',
                label: ({ i18n }) => i18n.t('collapsible:label'),
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)
                  })
                },
                order: 22,
              },
            ]),
          ],
        },
      }
    },
    key: 'collapsible',
  }
}
