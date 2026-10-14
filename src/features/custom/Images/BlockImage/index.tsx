import { HashtagNode } from '@lexical/hashtag'
import type { FeatureProvider } from '@payloadcms/richtext-lexical'

import { BlockImageConverter } from './converters'
import { ImageNode } from './nodes/ImageNode'

export type BlockImageFeatureProps = {
  /** Image src will be set as ${serverURL}/${filename}, where ${filename} is uploaded image filename.
  ${serverURL} should be publicly accessible. */
  serverURL: string
}

export const BlockImageFeature = (props: BlockImageFeatureProps): FeatureProvider => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: ImageNode.getType(),
            converters: {
              html: BlockImageConverter,
            },
            node: ImageNode,
          },
          {
            type: HashtagNode.getType(),
            node: HashtagNode,
          },
        ],
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.default),
            position: 'normal',
          },
        ],
        props,
      }
    },
    key: 'block-image',
  }
}
