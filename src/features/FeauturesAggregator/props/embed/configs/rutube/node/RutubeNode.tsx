import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical'

import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import type { SerializedDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'
import { DecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'
import * as React from 'react'

type RutubeComponentProps = Readonly<{
  className: Readonly<{
    base: string
    focus: string
  }>
  format: ElementFormatType | null
  nodeKey: NodeKey
  videoID: string
}>

function RutubeComponent({ className, format, nodeKey, videoID }: RutubeComponentProps) {
  return (
    <BlockWithAlignableContents className={className} format={format} nodeKey={nodeKey}>
      <iframe
        width="560"
        height="315"
        src={`https://rutube.ru/play/embed/${videoID}`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </BlockWithAlignableContents>
  )
}

export type SerializedRutubeNode = Spread<
  {
    videoID: string
  },
  SerializedDecoratorBlockNode
>

function $convertRutubeElement(domNode: HTMLElement): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('data-lexical-rutube')
  if (videoID) {
    const node = $createRutubeNode(videoID)
    return { node }
  }
  return null
}

export class RutubeNode extends DecoratorBlockNode {
  __id: string

  static getType(): string {
    return 'rutube'
  }

  static clone(node: RutubeNode): RutubeNode {
    return new RutubeNode(node.__id, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedRutubeNode): RutubeNode {
    const node = $createRutubeNode(serializedNode.videoID)
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON(): SerializedRutubeNode {
    return {
      ...super.exportJSON(),
      type: 'rutube',
      version: 1,
      videoID: this.__id,
    }
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key)
    this.__id = id
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe')
    element.setAttribute('data-lexical-rutube', this.__id)
    element.setAttribute('width', '560')
    element.setAttribute('height', '315')
    element.setAttribute('src', `https://rutube.ru/play/embed/${this.__id}`)
    element.setAttribute('frameborder', '0')
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    )
    element.setAttribute('allowfullscreen', 'true')
    element.setAttribute('title', 'Rutube видео')
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-rutube')) {
          return null
        }
        return {
          conversion: $convertRutubeElement,
          priority: 1,
        }
      },
    }
  }

  updateDOM(): false {
    return false
  }

  getId(): string {
    return this.__id
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://rutube.ru/video/${this.__id}`
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    }
    return (
      <RutubeComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    )
  }
}

export function $createRutubeNode(videoID: string): RutubeNode {
  return new RutubeNode(videoID)
}

export function $isRutubeNode(
  node: RutubeNode | LexicalNode | null | undefined,
): node is RutubeNode {
  return node instanceof RutubeNode
}
