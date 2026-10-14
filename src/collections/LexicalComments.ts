import type { CollectionConfig } from 'payload/types'

import { isAdmin } from './access/isAdmin'

//TODO: add proper access level
export const LexicalComments: CollectionConfig = {
  slug: 'lexical-comments',
  // access: {
  //   create: isAdmin,
  //   delete: isAdmin,
  //   read: isAdmin,
  //   update: isAdmin,
  // },
  admin: {
    // hidden: true,
  },
  fields: [
    {
      name: 'comments',
      type: 'text',
    },
    {
      name: 'hash',
      type: 'text',
    },
  ],
}
