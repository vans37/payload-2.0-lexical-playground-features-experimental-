import type {
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'

import { $applyNodeReplacement, DecoratorNode } from 'lexical'
import * as React from 'react'
import InlineImageComponent from './components/InlineImageComponent'
import { ImageDataType } from '../../Shared/types'

export type Position = 'left' | 'right' | 'full' | undefined

export interface InlineImagePayload {
  fileData: ImageDataType
  altText: string
  src: string
  belongsTo: string
  isWebUploadable: boolean
  height?: number
  width?: number
  key?: NodeKey
  position?: Position
}

export interface UpdateInlineImagePayload {
  altText?: string
  position?: Position
}

export type SerializedInlineImageNode = Spread<
  {
    altText: string
    src: string
    belongsTo: string
    isWebUploadable: boolean
    height?: number
    width?: number
    position?: Position
    fileData?: ImageDataType
  },
  SerializedLexicalNode
>

export class InlineImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: 'inherit' | number
  __height: 'inherit' | number
  __position: Position
  __belongsTo: string
  __isWebUploadable: boolean
  __fileData: ImageDataType

  static getType(): string {
    return 'inline-image'
  }

  static clone(node: InlineImageNode): InlineImageNode {
    return new InlineImageNode(
      node.__src,
      node.__altText,
      node.__position,
      node.__belongsTo,
      node.__isWebUploadable,
      node.__fileData,
      node.__height,
      node.__width,
      node.__key,
    )
  }

  static importJSON(serializedNode: SerializedInlineImageNode): InlineImageNode {
    const { altText, height, width, src, position, belongsTo, isWebUploadable, fileData } =
      serializedNode
    const node = $createInlineImageNode({
      altText,
      height,
      position,
      src,
      width,
      belongsTo,
      isWebUploadable,
      fileData,
    })
    return node
  }

  constructor(
    src: string,
    altText: string,
    position: Position,
    belongsTo: string,
    isWebUploadable = true,
    fileData,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width || 'inherit'
    this.__height = height || 'inherit'
    this.__position = position
    this.__belongsTo = belongsTo
    this.__isWebUploadable = isWebUploadable
    this.__fileData = fileData
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img')
    element.setAttribute('src', this.__src)
    element.setAttribute('alt', this.__altText)
    element.setAttribute('width', this.__width.toString())
    element.setAttribute('height', this.__height.toString())
    return { element }
  }

  exportJSON(): SerializedInlineImageNode {
    return {
      altText: this.getAltText(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      position: this.__position,
      src: this.getSrc(),
      type: 'inline-image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
      belongsTo: this.getBelongsTo(),
      isWebUploadable: this.getIsWebUploadable(),
      fileData: this.getFileData(),
    }
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  setAltText(altText: string): void {
    const writable = this.getWritable()
    writable.__altText = altText
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  setIsWebUploadable(isUploadable: boolean): void {
    const writable = this.getWritable()
    writable.__isWebUploadable = isUploadable
  }

  getIsWebUploadable(): boolean {
    const self = this.getLatest()
    return self.__isWebUploadable
  }

  getFileData(): ImageDataType {
    const self = this.getLatest()
    return self.__fileData
  }

  getBelongsTo(): string | null {
    const self = this.getLatest()
    return self.__belongsTo
  }

  getPosition(): Position {
    return this.__position
  }

  setPosition(position: Position): void {
    const writable = this.getWritable()
    writable.__position = position
  }

  update(payload: UpdateInlineImagePayload): void {
    const writable = this.getWritable()
    const { altText, position } = payload
    if (altText !== undefined) {
      writable.__altText = altText
    }

    if (position !== undefined) {
      writable.__position = position
    }
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const className = `${config.theme.inlineImage} position-${this.__position}`
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(prevNode: InlineImageNode, dom: HTMLElement, config: EditorConfig): false {
    const position = this.__position
    if (position !== prevNode.__position) {
      const className = `${config.theme.inlineImage} position-${position}`
      if (className !== undefined) {
        dom.className = className
      }
    }
    return false
  }

  decorate(): JSX.Element {
    return (
      <InlineImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        nodeKey={this.getKey()}
        position={this.__position}
        isWebUploadable={this.__isWebUploadable}
        fileData={this.__fileData}
        belongsTo={this.__belongsTo}
      />
    )
  }
}

export function $createInlineImageNode({
  altText,
  position,
  height,
  src,
  width,
  key,
  belongsTo,
  isWebUploadable,
  fileData,
}: InlineImagePayload): InlineImageNode {
  return $applyNodeReplacement(
    new InlineImageNode(
      src,
      altText,
      position,
      belongsTo,
      isWebUploadable,
      fileData,
      width,
      height,
      key,
    ),
  )
}

export function $isInlineImageNode(node: LexicalNode | null | undefined): node is InlineImageNode {
  return node instanceof InlineImageNode
}
