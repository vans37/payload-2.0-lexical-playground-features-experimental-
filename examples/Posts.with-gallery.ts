// Optional experiment: enable local media/galleries in a Payload CMS 2 app.
// A separate collection with `slug: 'media'` and `upload` must be registered.
// This example is NOT a production-safe image upload/deletion workflow.
import type { CollectionConfig } from 'payload/types'
import { richText } from 'lexical-custom-features'

export const PostsWithGallery: CollectionConfig = {
  slug: 'gallery-posts',
  fields: [
    { name: 'title', type: 'text', required: true },
    richText({
      fieldName: 'content',
      uploadImageHook: {
        enabled: false, // Keep disabled until known hook security issues fixed.
        uploadCollection: 'media',
      },
      featureProps: {
        AIAssistant: { enabled: false },
        Comments: { enabled: false },
        BlockImage: {
          enabled: true,
          props: { serverURL: 'http://localhost:3000/media' },
        },
        Gallery: {
          enabled: true,
          props: {
            collections: {
              media: { serverURL: 'http://localhost:3000' },
            },
          },
        },
      },
    }),
  ],
}
