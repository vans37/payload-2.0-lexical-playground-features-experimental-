// Basic, intentionally cautious example for a Payload CMS 2.x application.
// Copy into your application's collections directory and register Posts in
// the collections array in payload.config.ts.
import type { CollectionConfig } from 'payload/types'
import { richText } from 'lexical-custom-features'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    richText({
      fieldName: 'content',
      uploadImageHook: {
        enabled: false, // Avoid remote URL fetches and destructive media cleanup.
        uploadCollection: 'media', // ignored while disabled; required by interface
      },
      featureProps: {
        AIAssistant: { enabled: false },
        Comments: { enabled: false },
        Gallery: { enabled: false },
        BlockImage: { enabled: false },
      },
    }),
  ],
}
