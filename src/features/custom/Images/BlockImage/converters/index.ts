import { type HTMLConverter } from '@payloadcms/richtext-lexical'

import type { SerializedImageNode } from '../nodes/ImageNode'
import { ImageNode } from '../nodes/ImageNode'

const generateHTML = async (node: SerializedImageNode): Promise<string> => {
  if (node.type === 'image') {
    let src = node.src
    const alt = node.altText || ''
    const width = node.width
    const height = node.height

    const caption = node.caption

    if (caption) {
      const html = String.raw`<figure>
                                <img src=${src} alt="${alt}" ${width ? `width="${width}"` : ''} ${
                                  height ? `height="${height}"` : ''
                                }>
                                <figcaption>${caption}</figcaption>
                              </figure>
                             `

      return html
    } else {
      const html = `<img src=${src} alt="${alt}" ${width ? `width="${width}"` : ''} ${
        height ? `height="${height}"` : ''
      }>`

      return html
    }
  }

  return ''
}

export const BlockImageConverter: HTMLConverter<SerializedImageNode> = {
  converter: async ({ node }) => {
    return await generateHTML(node)
  },
  nodeTypes: [ImageNode.getType()],
}
