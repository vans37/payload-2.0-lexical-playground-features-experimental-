import type { FeatureProvider } from '@payloadcms/richtext-lexical'

//Unused, tested for a proper gallery node structure when Decorator node is
//used instead of element node. Shared history is needed for history
//to work between nested and parent editors.
export const SharedHistoryFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.default),
            position: 'top',
          },
        ],
        props: null,
      }
    },
    key: 'shared_history',
  }
}
