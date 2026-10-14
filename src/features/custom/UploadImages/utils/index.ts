'server only'
import { randomUUID } from 'crypto'
import path from 'path'
import type { Payload } from 'payload'
import { type File } from 'payload/dist/uploads/types'
import slugify from 'slugify'

export const imageMimeTypes = {
  'image/apng': '.apng',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
}

export const validateUploadCollection = (slug: string, payload: Payload) => {
  if (!slug || typeof slug !== 'string' || slug.length === 0) {
    throw new Error(`validateUploadCollection wrong slug: ${slug}`)
  }

  const collection = payload?.collections[slug]

  if (!collection) {
    return false
  }

  if (!collection?.config?.upload) {
    return false
  }

  return true
}

const extractMetaData = (base64: string) => {
  const mimeType = base64.match(/^data:(image\/\w+);base64,/)[1]
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const buffer = Buffer.from(bytes)
  const size = buffer.length

  return { buffer, mimeType, size }
}

export const uploadFromFilePath = async (
  payload: Payload,
  collection: string,
  pathToMedia: string,
  data?: any,
) => {
  return await payload.create({
    collection: collection,
    filePath: path.resolve(pathToMedia),
    data,
  })
}

export const uploadFromDataUrl = async (
  payload: Payload,
  collectionSlug: string,
  data: {
    altText?: string
    base64: string
  },
  uploadCollectionOptions: any = {},
) => {
  const filePath = data.altText ? slugifyString(data.altText) : randomUUID()
  const { buffer, mimeType, size } = extractMetaData(data.base64)
  const fileExtension = imageMimeTypes[mimeType]

  if (!fileExtension) {
    payload.logger.error(`Unsupported mime type: ${mimeType}`)
    return
  }

  const fileName = data.altText ? slugifyString(data.altText) : filePath + fileExtension

  const file: File = {
    name: fileName,
    data: buffer,
    mimetype: mimeType,
    size,
  }

  try {
    return await payload.create({
      collection: collectionSlug,
      data: uploadCollectionOptions,
      file,
    })
  } catch (err: unknown) {
    payload.logger.error(err)
  }
}

export const uploadFromFile = async (
  payload: Payload,
  collection: string,
  file: File,
  data: any = {},
) => {
  return await payload.create({
    collection: collection,
    file,
    data,
  })
}

//This function is used when exporting lexical state to file.
//It grabs image data from collection and tranforms it back to base64 string.
//https://stackoverflow.com/a/20285053
export const convertToDataURL = (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }),
    )

export const slugifyString = (string: string) => {
  return slugify(string, {
    lower: true,
    replacement: '-',
    strict: true,
    trim: true,
  })
}
