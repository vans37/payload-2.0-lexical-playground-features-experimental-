import type { LexicalNode, NodeKey, Spread, SerializedElementNode, DOMExportOutput } from 'lexical'
import { $applyNodeReplacement, ElementNode } from 'lexical'
import { $createGalleryImageNode, $isGalleryImageNode, GalleryImageNode } from './ImageNode'
import { FileResultDataURL } from '../../../../lib/types'
import { ImageDataTypeWithSlug } from '../../Shared/types'

export type CustomGalleryField = {
  name: string
  props: Record<string, any>
}

export type CustomGalleryFields = CustomGalleryField[]

export type SerializedGalleryNode = Spread<
  {
    fieldPath: string
    customFields: CustomGalleryFields
  },
  SerializedElementNode
>

export class GalleryNode extends ElementNode {
  __isHighlighted: boolean
  __uploadsDrawerSlug: string
  __selectImageDrawerSlug: string
  __fieldPath: string
  __customFields: CustomGalleryFields

  static getType(): string {
    return 'gallery'
  }

  static clone(node: GalleryNode): GalleryNode {
    return new GalleryNode(node.__fieldPath, node.__customFields, node.__key)
  }

  constructor(fieldPath: string, customFields: CustomGalleryFields, key?: NodeKey) {
    super(key)
    this.__isHighlighted = false
    this.__customFields = customFields
    this.__fieldPath = fieldPath
    this.__uploadsDrawerSlug = `uploads_drawer_slug_${fieldPath}_${this.__key}`
    this.__selectImageDrawerSlug = `select_images_drawer_slug_${fieldPath}_${this.__key}`
  }

  static importJSON(serializedNode: SerializedGalleryNode): GalleryNode {
    const node = $createGalleryNode(serializedNode.fieldPath, serializedNode.customFields)
    return node
  }

  exportJSON(): SerializedGalleryNode {
    return {
      ...super.exportJSON(),
      fieldPath: this.__fieldPath,
      customFields: this.__customFields,
      type: 'gallery',
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const gallery = document.createElement('div')
    gallery.className = 'gallery'
    //restrict editing this node so that user wouldn't be able to insert
    //text and other nodes into the gallery
    gallery.contentEditable = 'false'
    //used in DND operations to let user reorder images inside gallery
    gallery.setAttribute('gallery-node-key', this.getKey())
    return gallery
  }

  exportDOM(): DOMExportOutput {
    return {
      element: null,
    }
  }

  updateDOM(prevNode: GalleryNode, dom: HTMLElement): boolean {
    const element = dom
    if (prevNode.__isHighlighted !== this.__isHighlighted) {
      if (this.__isHighlighted) {
        element.classList.add('selected')
      } else {
        element.classList.remove('selected')
      }
    }
    return false
  }

  canBeEmpty(): boolean {
    return true
  }

  setIsHighlighted(value: boolean): void {
    const writable = this.getWritable()
    writable.__isHighlighted = value
  }

  getIsHightlighted(): boolean {
    const self = this.getLatest()
    return self.__isHighlighted
  }

  setCustomFields(fields: CustomGalleryFields): void {
    const writable = this.getWritable()
    writable.__customFields = fields
  }

  getCustomFields(): CustomGalleryFields {
    const self = this.getLatest()
    return self.__customFields
  }
}

const checkGalleryNode = (galleryNode: GalleryNode) => {
  if (galleryNode && $isGalleryNode(galleryNode)) {
    return true
  } else {
    console.error(`Gallery node was not provided or is not a gallery node`)
    return false
  }
}

export function $checkUploadNodeExists(id: number | string, galleryNode: GalleryNode): boolean {
  let exists = false
  if (checkGalleryNode(galleryNode)) {
    const children = galleryNode.getChildren()
    exists = children.some(
      (child: LexicalNode) => $isGalleryImageNode(child) && child.getFileData()?.id === id,
    )
  }
  return exists
}

export function $checkFileNodeExists(file: FileResultDataURL, galleryNode: GalleryNode) {
  let exists = false
  if (checkGalleryNode) {
    const children = galleryNode.getChildren()
    //local files do not have id set
    const nodesFromFile = children.filter(
      (child: GalleryImageNode) =>
        child && $isGalleryImageNode(child) && child.getFileData()?.id === null,
    )
    exists = nodesFromFile.some((node: GalleryImageNode) => node.getSrc() === file.result)
  }
  return exists
}

export function $getUploadNodesCount(galleryNode: GalleryNode) {
  let count = 0
  if (checkGalleryNode(galleryNode)) {
    const children = galleryNode.getChildren()
    children.forEach((child: LexicalNode) => {
      if ($isGalleryImageNode(child) && child.getFileData()?.id !== null) {
        count++
      }
    })
  }
  return count
}

export function $insertImageFromUpload(upload: ImageDataTypeWithSlug, galleryNode: GalleryNode) {
  if (checkGalleryNode(galleryNode)) {
    if (!$checkUploadNodeExists(upload.id, galleryNode)) {
      const imageNode = $createGalleryImageNode({
        src: upload.url,
        altText: '',
        fileData: { ...upload },
        width: upload.width,
        height: upload.height,
        belongsTo: upload.slug,
      })
      galleryNode.append(imageNode)
    } else {
      console.error(`upload exists: ${upload}`)
    }
  }
}

export function $insertImageFromFile(file: FileResultDataURL, galleryNode: GalleryNode) {
  if (checkGalleryNode) {
    if (!$checkFileNodeExists(file, galleryNode)) {
      const imageNode = $createGalleryImageNode({
        src: file.result,
        altText: '',
        fileData: null,
        belongsTo: null,
      })
      galleryNode.append(imageNode)
    } else {
      console.error(`file exists: ${file}`)
    }
  }
}

export function $createGalleryNode(
  fieldPath: string,
  customFields: CustomGalleryFields,
): GalleryNode {
  const galleryNode = new GalleryNode(fieldPath, customFields)
  return $applyNodeReplacement(galleryNode)
}

export function $isGalleryNode(node: LexicalNode | null | undefined): node is GalleryNode {
  return node instanceof GalleryNode
}
