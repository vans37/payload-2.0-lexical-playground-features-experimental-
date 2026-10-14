import { PaginatedDocs } from 'payload/database'
import fetchResource, { isSuccessResponse } from '../../../lib/api/fetchResource'
import { CommentStore } from '../commenting'
import { SanitizedCollectionConfig } from '../../../../../../payload/src/collections/config/types'

export interface LexicalComment {
  id: number
  comments?: string | null
  hash: string
  updatedAt: string
  createdAt: string
}

const COLLECTION_SLUG = 'lexical-comments'
const API = '/api'

export const getCommentsFromCollection = async (
  hash: number,
  api = API,
  slug = COLLECTION_SLUG,
) => {
  if (!hash || isNaN(hash)) {
    throw new Error('Hash is not set or its type is not a number')
  }

  const response = await fetchResource<PaginatedDocs<LexicalComment>>(`${api}/${slug}`, {
    params: {
      where: {
        hash: {
          equals: hash,
        },
      },
    },
  })

  if (isSuccessResponse(response)) {
    return response.data.docs[0]?.comments
  }
}

export const pushCommentsToCollection = async ({
  comments,
  hash,
  api = API,
  slug = COLLECTION_SLUG,
}: {
  comments: string
  hash: number
  api: string
  slug: string
}) => {
  if (!hash || isNaN(hash)) {
    throw new Error('Hash is not set or its type is not a number')
  }

  let docID: number

  try {
    const response = await fetchResource<PaginatedDocs<LexicalComment>>(`${api}/${slug}`, {
      params: {
        where: {
          hash: {
            equals: hash,
          },
        },
      },
    })

    if (isSuccessResponse(response)) {
      docID = response.data.docs[0]?.id
    }

    if (!docID) {
      throw new Error(`Comment with hash ${hash} does not exist`)
    }

    await fetchResource<LexicalComment>(`${api}/${slug}/${docID}`, {
      init: {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: hash.toString(),
          comments,
        }),
      },
    })
  } catch (err) {
    throw new Error(`${err}`)
  }
}

export const saveComments = (
  commentStore: CommentStore,
  hash: number,
  api = API,
  slug = COLLECTION_SLUG,
) => {
  if (!hash || isNaN(hash)) {
    throw new Error('Hash is not set or its type is not a number')
  }

  const comments = commentStore.getComments()
  const serializedComments = JSON.stringify(comments)

  void pushCommentsToCollection({
    comments: serializedComments,
    hash,
    api,
    slug,
  })
}

export const prepareCommentsCollection = async (
  collections: SanitizedCollectionConfig[],
  hash: number,
  api = API,
  slug = COLLECTION_SLUG,
): Promise<boolean> => {
  if (!hash || isNaN(hash)) {
    console.error('Hash is not set or its type is not a number')
    return false
  }

  if (!collections.find((collection) => collection.slug === slug)) {
    console.error(`Collection ${slug} does not exist`)
    return false
  }

  try {
    const response = await fetchResource<PaginatedDocs<LexicalComment>>(`${api}/${slug}`, {
      params: {
        where: {
          hash: {
            equals: hash,
          },
        },
      },
    })

    if (!isSuccessResponse(response)) {
      return false
    }

    const stringifiedBody = JSON.stringify({
      hash: hash.toString(),
      comments: JSON.stringify([]),
    })

    if (response.data?.docs?.length === 0) {
      const ok = await fetchResource<LexicalComment>(`${api}/${slug}`, {
        init: {
          method: 'POST',
          body: stringifiedBody,
        },
      })

      if (isSuccessResponse(ok)) {
        return true
      } else {
        return false
      }
    }
  } catch (err) {
    console.error(err)
    return false
  }
}
