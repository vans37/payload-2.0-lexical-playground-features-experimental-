import { FeatureProviderWithToolbar } from '../../lib/types'

export const PayloadToolbarFeature = (): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            Component: () =>
              //@ts-ignore
              import('./plugin/fixed/Toolbar').then((module) => module.FixedToolbarPlugin),
            position: 'top',
          },
          {
            Component: () =>
              //@ts-ignore
              import('./plugin/inline/Toolbar').then((module) => module.InlineToolbarPlugin),
            position: 'floatingAnchorElem',
          },
        ],
        props: null,
      }
    },
    key: 'payload_toolbar',
  }
}
