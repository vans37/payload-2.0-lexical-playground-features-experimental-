import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { Resource } from '../I18n/types'
import './index.scss'

export type ActionFeatureProps = {
  translation: Resource
}

export const ActionsFeature = (props: ActionFeatureProps): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('../Shared/TranslationPlugin').then((module) => {
                const plugin = module.default
                return () => plugin('actions')
              }),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.ActionsPlugin),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./ClearEditor').then((module) => module.default),
            position: 'normal',
          },
          {
            //@ts-ignore
            Component: () => import('./SpeechToText').then((module) => module.default),
            position: 'normal',
          },
        ],
        props,
      }
    },
    key: 'actions',
  }
}
