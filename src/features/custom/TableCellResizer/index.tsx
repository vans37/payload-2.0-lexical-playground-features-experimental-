import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const TableCellResizerFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.default),
            position: 'bottom',
          },
        ],
        props: null,
      }
    },
    key: 'table_cell_resizer',
  }
}
