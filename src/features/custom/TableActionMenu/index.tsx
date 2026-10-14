import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { Resource } from 'i18next'

export type TableActionMenuProps = {
  translation?: Resource
  /** #RRGGBBAA */
  predefinedColors?: string[]
}

export const TableActionMenuFeature = (props): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('table_action_menu')
              }),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.default),
            position: 'floatingAnchorElem',
          },
        ],
        props,
      }
    },
    key: 'table_action_menu',
  }
}
