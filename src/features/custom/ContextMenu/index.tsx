import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const ContextMenuFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.default),
            position: 'normal',
          },
        ],
        props: null,
      }
    },
    key: 'context_menu',
  }
}
