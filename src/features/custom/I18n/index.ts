import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const I18nFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.I18nPlugin),
            position: 'top',
          },
        ],
        props: null,
      }
    },
    key: 'custom_i18n',
  }
}
