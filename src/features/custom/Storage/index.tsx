import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export type GlobalStorageFeature = {}

export const GlobalStorageFeature = (): FeatureProvider => {
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
    key: 'global_storage',
  }
}
