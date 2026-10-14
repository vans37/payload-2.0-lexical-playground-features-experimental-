import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const TableHoverActionsFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.TableHoverActionsPlugin),
            position: 'floatingAnchorElem',
          },
        ],
        props: null,
      }
    },
    key: 'table_hover_actions',
  }
}
