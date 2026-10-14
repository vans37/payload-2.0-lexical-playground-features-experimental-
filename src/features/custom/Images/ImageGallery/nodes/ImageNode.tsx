import type {
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'

import { DecoratorNode } from 'lexical'
import * as React from 'react'
import ImageComponent from './components/Image'
import { ImageDataType } from '../../Shared/types'

export interface ImagePayload {
  altText: string
  caption?: string
  height?: number
  key?: NodeKey
  maxWidth?: number
  src: string
  width?: number
  mimetype?: string
  belongsTo?: string
  fileData?: ImageDataType
}

export type SerializedGalleryImageNode = Spread<
  {
    altText: string
    caption: string
    height?: number
    maxWidth: number
    src: string
    width?: number
    type: 'gallery-image'
    version: 1
    mimetype?: string
    /** What collection image belongs to */
    belongsTo?: string
    /** FileData is a payload upload data */
    fileData?: ImageDataType
  },
  SerializedLexicalNode
>

export class GalleryImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: number
  __height: number
  __maxWidth: number
  __caption: string | undefined
  __mimetype: string
  __belongsTo: string
  __fileData: ImageDataType

  static getType(): string {
    return 'gallery-image'
  }

  static clone(node: GalleryImageNode): GalleryImageNode {
    return new GalleryImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__caption,
      node.__key,
      node.__mimetype,
      node.__belongsTo,
      node.__fileData,
    )
  }

  static importJSON(serializedNode: SerializedGalleryImageNode): GalleryImageNode {
    const { altText, height, width, maxWidth, caption, src, mimetype, belongsTo, fileData } =
      serializedNode
    const node = $createGalleryImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
      caption,
      mimetype,
      belongsTo,
      fileData,
    })

    return node
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('figure')
    const figCaption = document.createElement('figcaption')
    figCaption.textContent = this.__caption || ''
    const image = document.createElement('img')
    image.setAttribute('src', this.__src)
    image.setAttribute('alt', this.__altText)
    element.appendChild(figCaption)
    element.appendChild(image)

    return { element }
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: number,
    height?: number,
    caption?: string,
    key?: NodeKey,
    mimeType?: string,
    belongsTo?: string,
    fileData?: ImageDataType,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__maxWidth = maxWidth
    this.__width = width
    this.__height = height
    this.__mimetype = mimeType
    this.__caption = caption
    this.__belongsTo = belongsTo
    this.__fileData = fileData
  }

  exportJSON(): SerializedGalleryImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption || '',
      height: this.__height,
      maxWidth: this.__maxWidth,
      src: this.getSrc(),
      type: 'gallery-image',
      version: 1,
      width: this.__width,
      belongsTo: this.getBelongsTo(),
      fileData: this.getFileData(),
    }
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  setCaption(caption: string): void {
    const writable = this.getWritable()
    writable.__caption = caption
  }

  getCaption(): string | undefined {
    const self = this.getLatest()
    return self.__caption
  }

  getSrc(): string {
    const self = this.getLatest()
    return self.__src
  }

  getFileData(): ImageDataType {
    const self = this.getLatest()
    return self.__fileData
  }

  getBelongsTo(): string {
    const self = this.getLatest()
    return self.__belongsTo
  }

  getAltText(): string {
    return this.__altText
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    //used in DND to let user reorder images
    span.setAttribute('node-key', this.getKey())
    const theme = config.theme
    const className = theme.image
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
        caption={this.__caption || ''}
        mimetype={this.__mimetype}
        belongsTo={this.__belongsTo}
        galleryKey={this.getParent().getKey()}
        fileData={this.getFileData()}
      />
    )
  }
}

export function $createGalleryImageNode({
  altText,
  height,
  maxWidth = 500,
  src,
  width,
  caption,
  key,
  mimetype: mimeType,
  belongsTo,
  fileData,
}: ImagePayload): GalleryImageNode {
  return new GalleryImageNode(
    src,
    altText,
    maxWidth,
    width,
    height,
    caption,
    key,
    mimeType,
    belongsTo,
    fileData,
  )
}

export function $isGalleryImageNode(
  node: LexicalNode | null | undefined,
): node is GalleryImageNode {
  return node instanceof GalleryImageNode
}
