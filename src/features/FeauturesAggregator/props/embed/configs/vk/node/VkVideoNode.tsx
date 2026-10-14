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

type VkVideoComponentProps = Readonly<{
  className: Readonly<{
    base: string
    focus: string
  }>
  format: ElementFormatType | null
  nodeKey: NodeKey
  videoID: string
  ownerID: string
}>

function VkVideoComponent({ className, format, nodeKey, ownerID, videoID }: VkVideoComponentProps) {
  return (
    <BlockWithAlignableContents className={className} format={format} nodeKey={nodeKey}>
      <iframe
        width="560"
        height="315"
        src={`https://vk.com/video_ext.php?oid=${ownerID}&id=${videoID}&hd=3`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="VK видео"
      />
    </BlockWithAlignableContents>
  )
}

export type SerializedVkVideoNode = Spread<
  {
    videoID: string
    ownerID: string
    url: string
  },
  SerializedDecoratorBlockNode
>

function $convertVkVideoElement(domNode: HTMLElement): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('data-lexical-vk')
  const ownerID = domNode.getAttribute('data-lexical-owner')
  const url = domNode.getAttribute('data-lexical-url')

  if (videoID && ownerID && url) {
    const node = $createVkVideoNode(url, ownerID, videoID)
    return { node }
  }
  return null
}

export class VkVideoNode extends DecoratorBlockNode {
  __url: string
  __ownerID: string
  __videoID: string

  static getType(): string {
    return 'vk-video'
  }

  static clone(node: VkVideoNode): VkVideoNode {
    return new VkVideoNode(node.__url, node.__ownerID, node.__videoID, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedVkVideoNode): VkVideoNode {
    const node = $createVkVideoNode(
      serializedNode.url,
      serializedNode.ownerID,
      serializedNode.videoID,
    )
    node.setFormat(serializedNode.format)
    return node
  }

  exportJSON(): SerializedVkVideoNode {
    return {
      ...super.exportJSON(),
      type: 'vk-video',
      version: 1,
      videoID: this.__videoID,
      ownerID: this.__ownerID,
      url: this.__url,
    }
  }

  constructor(
    url: string,
    ownerID: string,
    videoID: string,
    format?: ElementFormatType,
    key?: NodeKey,
  ) {
    super(format, key)
    this.__url = url
    this.__videoID = videoID
    this.__ownerID = ownerID
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe')
    element.setAttribute('data-lexical-url', this.__url)
    element.setAttribute('data-lexical-videoID', this.__videoID)
    element.setAttribute('data-lexical-ownerID', this.__ownerID)
    element.setAttribute('width', '560')
    element.setAttribute('height', '315')
    element.setAttribute(
      'src',
      `https://vk.com/video_ext.php?oid=${this.__ownerID}&id=${this.__videoID}&hd=3`,
    )
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
        if (!domNode.hasAttribute('data-lexical-vk')) {
          return null
        }
        return {
          conversion: $convertVkVideoElement,
          priority: 1,
        }
      },
    }
  }

  updateDOM(): false {
    return false
  }

  //   getId(): string {
  //     return this.__id
  //   }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://vk.com/video_ext.php?oid=${this.__ownerID}&id=${this.__videoID}&hd=3`
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    }
    return (
      <VkVideoComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__videoID}
        ownerID={this.__ownerID}
      />
    )
  }
}

export function $createVkVideoNode(url: string, ownerID: string, videoID: string): VkVideoNode {
  return new VkVideoNode(url, ownerID, videoID)
}

export function $isRutubeNode(
  node: VkVideoNode | LexicalNode | null | undefined,
): node is VkVideoNode {
  return node instanceof VkVideoNode
}
