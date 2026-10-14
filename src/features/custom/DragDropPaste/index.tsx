import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const DragDropPasteFeature = (): FeatureProvider => {
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
    key: 'drag_drop_paste',
  }
}
