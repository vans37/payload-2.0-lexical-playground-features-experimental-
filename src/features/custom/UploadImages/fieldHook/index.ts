import { randomUUID } from 'crypto'
import type LexicalEditor from 'lexical'
import type { Payload } from 'payload'
import type { FieldHookArgs } from 'payload/types'
import { setProperty } from '../../../../features/lib/utils/dotProp'

import {
  imageMimeTypes,
  slugifyString,
  uploadFromDataUrl,
  uploadFromFile,
  validateUploadCollection,
} from '../utils'

import { SerializedElementNode, SerializedLexicalNode } from 'lexical'
import { SerializedImageNode } from '../../Images/BlockImage/nodes/ImageNode'
import { SerializedInlineImageNode } from '../../Images/InlineImage/nodes/InlineImageNode'
import { SerializedGalleryImageNode } from '../../Images/ImageGallery/nodes/ImageNode'

type ImageNodeType =
  | (SerializedImageNode & { type: 'image' })
  | (SerializedInlineImageNode & { type: 'inline-image' })
  | (SerializedGalleryImageNode & { type: 'gallery-image' })

class ServerLexicalState {
  state: LexicalEditor.SerializedEditorState[] = []

  setState(state: LexicalEditor.SerializedEditorState) {
    this.state.push(state)
  }

  extractImageNodesFromState(serializedLexicalState: LexicalEditor.SerializedEditorState) {
    const images: Array<SerializedImageNode | SerializedInlineImageNode> = []

    const traverse = (node: SerializedLexicalNode) => {
      if (node.type === 'image' && (node as SerializedImageNode).isWebUploadable) {
        images.push(node as SerializedImageNode)
      } else if (node.type === 'gallery-image') {
        // skip, otherwise gallery will not be able to load image
        return
      } else if (
        node.type === 'inline-image' &&
        (node as SerializedInlineImageNode).isWebUploadable
      ) {
        images.push(node as SerializedInlineImageNode)
      }

      const element = node as SerializedElementNode
      if (element.children && element.children.length > 0) {
        element.children.forEach((child) => traverse(child))
      }
    }

    traverse(serializedLexicalState.root)

    return images
  }

  findRemovedImageNodes() {
    const [prevState, currState] = this.state
    if (!prevState || !currState) return []

    const prevStateImages = this.extractImageNodesFromState(prevState)
    const currentStateImages = this.extractImageNodesFromState(currState)

    const removedImages = prevStateImages.filter(
      (prevImage) =>
        !currentStateImages.some(
          (currImage) => currImage?.fileData?.id === prevImage?.fileData?.id,
        ),
    )

    return removedImages
  }

  async deleteRemovedImageNodes(
    payloadInstance: Payload,
    removedNodes: Array<
      SerializedGalleryImageNode | SerializedImageNode | SerializedInlineImageNode
    >,
    collectionSlug: string,
  ) {
    if (!validateUploadCollection(collectionSlug, payloadInstance)) {
      throw new Error(
        `deleteRemovedImageNodes slug '${collectionSlug}' does not exist or not upload enabled`,
      )
    }

    if (removedNodes.length === 0) return

    try {
      const promises = removedNodes.map((image) =>
        payloadInstance.delete({
          id: image.fileData?.id,
          collection: collectionSlug,
        }),
      )
      await Promise.allSettled(promises)
    } catch (err: unknown) {
      // best-effort; log and continue
      // payloadInstance.logger may be undefined in some contexts but usually exists
      try {
        payloadInstance.logger?.error(err)
      } catch {}
    }
  }
}

const uploadImageFromBase64 = async (
  payloadInstance: Payload,
  collectionSlug: string,
  node: ImageNodeType,
  rootObject: LexicalEditor.SerializedEditorState,
  path: string,
  src: string,
) => {
  try {
    const uploadedMedia: any = await uploadFromDataUrl(
      payloadInstance,
      collectionSlug,
      { altText: (node as SerializedImageNode).altText, base64: src },
      { focalX: 50, focalY: 50 },
    )

    node.src = uploadedMedia.url
    node.fileData = { ...uploadedMedia }

    if (node.type === 'gallery-image') {
      ;(node as SerializedGalleryImageNode).belongsTo = collectionSlug
    }

    setProperty(rootObject, path, node)

    return uploadedMedia
  } catch (err: unknown) {
    try {
      payloadInstance.logger?.error(err)
    } catch {}
    return null
  }
}

const uploadImageFromWeb = async (
  payloadInstance: Payload,
  collectionSlug: string,
  node: ImageNodeType,
  rootObject: LexicalEditor.SerializedEditorState,
  path: string,
  src: string,
) => {
  try {
    const response = await fetch(src)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const imageBlob = await response.blob()
    const mimeType = imageBlob.type
    const dataArray = await imageBlob.arrayBuffer()
    const buff = Buffer.from(dataArray)
    const size = buff.length
    const alt = (node as SerializedImageNode).altText
    const fileExtension = imageMimeTypes[mimeType] ?? ''
    const filename = alt ? slugifyString(alt) : randomUUID()

    const file = {
      name: filename + fileExtension,
      data: buff,
      mimetype: mimeType,
      size,
    }

    const uploadedMedia: any = await uploadFromFile(payloadInstance, collectionSlug, file)

    node.src = uploadedMedia.url
    node.fileData = { ...uploadedMedia }

    if (node.type === 'gallery-image') {
      ;(node as SerializedGalleryImageNode).belongsTo = collectionSlug
    }

    setProperty(rootObject, path, node)

    return uploadedMedia
  } catch (err: unknown) {
    try {
      payloadInstance.logger?.error(err)
    } catch {}
    return null
  }
}

// recursively traverse and upload images
const findAndUploadImages = async (
  rootObject: LexicalEditor.SerializedEditorState,
  node: SerializedLexicalNode,
  path = 'root',
  payloadInstance: Payload,
  collectionSlug: string,
  uploadCache: Map<string, any>,
) => {
  if (!collectionSlug) throw new Error(`uploadImages hook: collection slug was not provided`)
  if (!validateUploadCollection(collectionSlug, payloadInstance)) {
    throw new Error(
      `uploadImages hook: collection ${collectionSlug} does not exist or not upload enabled`,
    )
  }

  // traverse children in parallel when possible
  const element = node as SerializedElementNode
  if (element.children && element.children.length > 0) {
    await Promise.all(
      element.children.map((child, i) => {
        const childPath = `${path}.children[${i}]`
        return findAndUploadImages(
          rootObject,
          child,
          childPath,
          payloadInstance,
          collectionSlug,
          uploadCache,
        )
      }),
    )
  }

  // helper to normalize common data
  const getCommonData = (n: ImageNodeType) => ({
    src: (n as any).src as string | undefined,
    id: n?.fileData?.id,
  })

  const checkIDExists = async (id: string | number) => {
    try {
      const existingMedia = await payloadInstance.findByID({ id, collection: collectionSlug })
      return existingMedia?.id === id
    } catch (err: unknown) {
      // log and assume it doesn't exist to avoid skipping
      try {
        payloadInstance.logger?.error(err)
      } catch {}
      return false
    }
  }

  const uploadImage = async (src: string, nodeToUpload: ImageNodeType) => {
    if (!src) return null

    // reuse uploads for identical sources
    if (uploadCache.has(src)) {
      const cached = uploadCache.get(src)
      nodeToUpload.src = cached.url
      nodeToUpload.fileData = { ...cached }
      if (nodeToUpload.type === 'gallery-image')
        (nodeToUpload as SerializedGalleryImageNode).belongsTo = collectionSlug
      setProperty(rootObject, path, nodeToUpload)
      return cached
    }

    let uploaded = null
    if (src.startsWith('data:image')) {
      uploaded = await uploadImageFromBase64(
        payloadInstance,
        collectionSlug,
        nodeToUpload,
        rootObject,
        path,
        src,
      )
    } else if (src.startsWith('http')) {
      uploaded = await uploadImageFromWeb(
        payloadInstance,
        collectionSlug,
        nodeToUpload,
        rootObject,
        path,
        src,
      )
    }

    if (uploaded) uploadCache.set(src, uploaded)
    return uploaded
  }

  switch (node.type) {
    case 'image': {
      const imageNode = node as SerializedImageNode
      const { src, id } = getCommonData(imageNode as ImageNodeType)

      if (!imageNode.isWebUploadable) return
      if (id && (await checkIDExists(id))) return

      await uploadImage(src ?? '', imageNode as ImageNodeType)
      break
    }
    case 'gallery-image': {
      const galleryNode = node as SerializedGalleryImageNode
      const { src, id } = getCommonData(galleryNode as ImageNodeType)
      if (id && (await checkIDExists(id))) return
      await uploadImage(src ?? '', galleryNode as ImageNodeType)
      break
    }
    case 'inline-image': {
      const inlineNode = node as SerializedInlineImageNode
      const { src, id } = getCommonData(inlineNode as ImageNodeType)
      if (id && (await checkIDExists(id))) return
      await uploadImage(src ?? '', inlineNode as ImageNodeType)
      break
    }
    default:
      break
  }
}

export const uploadImagesHook = async (args: FieldHookArgs, uploadCollectionSlug: string) => {
  const { previousValue, req, value } = args
  const payloadInstance = req.payload

  if (!validateUploadCollection(uploadCollectionSlug, payloadInstance)) {
    throw new Error(
      `uploadImagesHook uploadCollectionSlug '${uploadCollectionSlug}' does not exist or is not upload enabled`,
    )
  }

  const valueCopy = value ? JSON.parse(JSON.stringify(value)) : null

  if (valueCopy?.root) {
    const isInitialUpload =
      !previousValue ||
      (previousValue?.root?.children?.length === 1 &&
        previousValue?.root?.children[0]?.type === 'paragraph' &&
        previousValue?.root?.children[0]?.children?.length === 0)

    const uploadCache = new Map<string, any>()

    if (isInitialUpload) {
      await findAndUploadImages(
        valueCopy,
        valueCopy.root,
        'root',
        payloadInstance,
        uploadCollectionSlug,
        uploadCache,
      )
      return valueCopy
    }

    const lexicalServerState = new ServerLexicalState()
    lexicalServerState.setState(previousValue)
    lexicalServerState.setState(valueCopy)

    const removedImageNodes = lexicalServerState.findRemovedImageNodes()
    await lexicalServerState.deleteRemovedImageNodes(
      payloadInstance,
      removedImageNodes,
      uploadCollectionSlug,
    )

    await findAndUploadImages(
      valueCopy,
      valueCopy.root,
      'root',
      payloadInstance,
      uploadCollectionSlug,
      uploadCache,
    )

    return valueCopy
  }

  return null
}
