import { FileData, TypeWithID } from 'payload/types'

export type ImageDataType = FileData & TypeWithID

export type ImageDataTypeWithSlug = ImageDataType & {
  slug: string
}

export type ImageType = 'block-image' | 'gallery-image' | 'inline-image'
