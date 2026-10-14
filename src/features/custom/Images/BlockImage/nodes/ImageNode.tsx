import * as React from 'react'
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'

import ImageComponent from './ImageComponent'

import './ImageNode.css'
import { ImageDataType } from '../../Shared/types'

export interface ImagePayload {
  altText: string
  caption?: string
  height?: number
  key?: NodeKey
  maxWidth?: number
  showCaption?: boolean
  src: string
  width?: number
  isWebUploadable?: boolean // if true image is uploaded from web to media, otherwise its url is preserved
  fileData?: ImageDataType
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src } = domNode
    const node = $createImageNode({ altText, src })
    return { node }
  }
  return null
}

export type SerializedImageNode = Spread<
  {
    altText: string
    caption: string
    height?: number
    maxWidth: number
    showCaption: boolean
    src: string
    width?: number
    type: 'image'
    version: 1
    isWebUploadable?: boolean
    fileData?: ImageDataType
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: 'inherit' | number
  __height: 'inherit' | number
  __maxWidth: number
  __showCaption: boolean
  __caption: string
  __isWebUploadable: boolean
  __fileData: ImageDataType

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__key,
      node.__isWebUploadable,
      node.__fileData,
    )
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const {
      altText,
      height,
      width,
      maxWidth,
      caption,
      src,
      showCaption,
      isWebUploadable,
      fileData,
    } = serializedNode
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
      caption,
      isWebUploadable,
      fileData,
    })

    return node
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('figure')
    const figCaption = document.createElement('figcaption')
    figCaption.textContent = this.__caption
    const image = document.createElement('img')
    image.setAttribute('src', this.__src)
    image.setAttribute('alt', this.__altText)
    element.appendChild(figCaption)
    element.appendChild(image)

    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 4,
      }),
    }
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    showCaption?: boolean,
    caption?: string,
    key?: NodeKey,
    isWebUploadable = true,
    fileData?: ImageDataType,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__maxWidth = maxWidth
    this.__width = width || 'inherit'
    this.__height = height || 'inherit'
    this.__showCaption = showCaption || false
    this.__caption = caption
    this.__isWebUploadable = isWebUploadable
    this.__fileData = fileData
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption,
      height: this.__height === 'inherit' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
      isWebUploadable: this.getIsWebUploadable(),
      fileData: this.getFileData(),
    }
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable()
    writable.__showCaption = showCaption
  }

  setCaption(caption: string): void {
    const writable = this.getWritable()
    writable.__caption = caption
  }

  getCaption(): string {
    const self = this.getLatest()
    return self.__caption
  }

  setIsWebUploadable(isUploadable: boolean): void {
    const writable = this.getWritable()
    writable.__isWebUploadable = isUploadable
  }

  getIsWebUploadable(): boolean {
    const self = this.getLatest()
    return self.__isWebUploadable
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
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

  getSrc(): string {
    const self = this.getLatest()
    return self.__src
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  getFileData(): ImageDataType {
    const self = this.getLatest()
    return self.__fileData
  }

  getAltText(): string {
    return this.__altText
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        captionsEnabled
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
        showCaption={this.__showCaption}
        caption={this.__caption}
        isWebUploadable={this.__isWebUploadable}
        fileData={this.getFileData()}
        resizable
      />
    )
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  src,
  width,
  showCaption,
  caption,
  key,
  isWebUploadable,
  fileData,
}: ImagePayload): ImageNode {
  return new ImageNode(
    src,
    altText,
    maxWidth,
    width,
    height,
    showCaption,
    caption,
    key,
    isWebUploadable,
    fileData,
  )
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
