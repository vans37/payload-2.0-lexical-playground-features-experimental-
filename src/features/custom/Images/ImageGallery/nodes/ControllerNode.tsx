import type { DOMExportOutput, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical'

import { DecoratorNode } from 'lexical'
import * as React from 'react'
import ControllerComponent from './components/Controller'

export type SerializedGalleryControllerNode = Spread<
  {
    type: 'gallery-controller'
    version: 1
  },
  SerializedLexicalNode
>

export class GalleryControllerNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'gallery-controller'
  }

  static clone(node: GalleryControllerNode): GalleryControllerNode {
    return new GalleryControllerNode()
  }

  static importJSON(serializedNode: SerializedGalleryControllerNode): GalleryControllerNode {
    const node = $createGalleryControllerNode()
    return node
  }

  exportDOM(): DOMExportOutput {
    return {
      element: null,
    }
  }

  exportJSON(): SerializedGalleryControllerNode {
    return {
      type: 'gallery-controller',
      version: 1,
    }
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.classList.add('controller-node')
    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return <ControllerComponent galleryNode={this.getParent()} />
  }
}

export function $createGalleryControllerNode(): GalleryControllerNode {
  return new GalleryControllerNode()
}

export function $isGalleryControllerNode(
  node: LexicalNode | null | undefined,
): node is GalleryControllerNode {
  return node instanceof GalleryControllerNode
}
