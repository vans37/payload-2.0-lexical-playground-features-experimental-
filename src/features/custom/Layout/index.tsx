import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { INSERT_LAYOUT_DIALOG_COMMAND } from './plugin'
import { LayoutItemNode } from './nodes/LayoutItemNode'
import { LayoutContainerNode } from './nodes/LayoutContainerNode'
import { LayoutContainerConverter, LayoutItemConverter } from './converters'
import { toolbarAddDropdownGroupWithItems } from '../../default/Shared/toolbar/addDropdownGroup'

import { LayoutIcon } from '../../lib/ui/icons/Layout'
import { Resource } from '../I18n/types'

export type LayoutFeatureProps = {
  translation?: Resource
}

export const LayoutFeature = (props: LayoutFeatureProps): FeatureProvider => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: LayoutContainerNode.getType(),
            node: LayoutContainerNode,
            converters: {
              html: LayoutContainerConverter,
            },
          },
          {
            type: LayoutItemNode.getType(),
            node: LayoutItemNode,
            converters: {
              html: LayoutItemConverter,
            },
          },
        ],
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('layout')
              }),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.LayoutPlugin),
            position: 'normal',
          },
        ],
        props,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('layout:slash_menu_title'),
              key: 'custom',
              options: [
                new SlashMenuOption('Layout', {
                  Icon: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/Layout').then((module) => module.LayoutIcon),
                  displayName: ({ i18n }) => i18n.t('layout:slash_menu_label'),
                  keywords: ['layout', 'columns'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_LAYOUT_DIALOG_COMMAND, true)
                  },
                }),
              ],
            },
          ],
        },
        toolbarFixed: {
          groups: [
            toolbarAddDropdownGroupWithItems([
              {
                ChildComponent: LayoutIcon,
                key: 'layout',
                label: ({ i18n }) => i18n.t('layout:label'),
                onSelect: ({ editor }) => {
                  editor.update(() => {
                    editor.dispatchCommand(INSERT_LAYOUT_DIALOG_COMMAND, true)
                  })
                },
                order: 21,
              },
            ]),
          ],
        },
      }
    },
    key: 'layout',
  }
}
