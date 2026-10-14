import type { DOMExportOutput, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical'

import { DecoratorNode } from 'lexical'
import * as React from 'react'
import ControlsComponent from './components/Controls'

export type SerializedGalleryControlsNode = Spread<
  {
    type: 'gallery-handler'
    version: 1
  },
  SerializedLexicalNode
>

/* 
  This decorator node is responsible for rendering gallery controls (control buttons to open drawer etc)
  and controlling gallery (inserting gallery image nodes, removing, handling selection etc).
  It is a direct child of ElementNode (GalleryNode). 
  A better 'right' lexical way would be to have a single DecoratorNode as gallery and handle
  its children via nested editor, but due to some unfixed in lexical 0.13.1 bugs handling history is bugged:
  no proper undo/redo functionality when nested editor history changes (could be patched, but
  will require patching payload's lexical implementation and rebuilding it, plus patching lexical's history
  implementation); bugs with nested editor not focusing thus inserting first image will not be part of history state;
  collaboration won' work properly etc.

  This implementation itself has an issue with handling selection; a handler node and controls node
  are direct child of a gallery node and should be ignored when parsing editor state.
*/

export class GalleryControlsNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'gallery-handler'
  }

  static clone(node: GalleryControlsNode): GalleryControlsNode {
    return new GalleryControlsNode()
  }

  static importJSON(serializedNode: SerializedGalleryControlsNode): GalleryControlsNode {
    const node = $createGalleryControlsNode()
    return node
  }

  exportDOM(): DOMExportOutput {
    return {
      element: null,
    }
  }

  exportJSON(): SerializedGalleryControlsNode {
    return {
      type: 'gallery-handler',
      version: 1,
    }
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.className = 'gallery-controls'

    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return <ControlsComponent galleryNode={this.getParent()} nodeKey={this.getKey()} />
  }
}

export function $createGalleryControlsNode(): GalleryControlsNode {
  return new GalleryControlsNode()
}

export function $isGalleryControlsNode(
  node: LexicalNode | null | undefined,
): node is GalleryControlsNode {
  return node instanceof GalleryControlsNode
}
