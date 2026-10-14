import type {
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import { Comments } from '../commenting'

export type SerializedCommentsNode = Spread<
  {
    comments: Comments
    hash: number
  },
  SerializedLexicalNode
>

export class CommentsNode extends DecoratorNode<JSX.Element> {
  __comments: Comments
  __hash: number

  constructor(comments: Comments, hash: number, key?: NodeKey) {
    super(key)
    this.__comments = comments
    this.__hash = hash
  }

  static clone(node: CommentsNode): CommentsNode {
    return new CommentsNode(node.__comments, node.__hash, node.__key)
  }

  static getType(): string {
    return 'comments'
  }

  static importDOM(): null {
    return null
  }

  static importJSON(serializedNode: SerializedCommentsNode): CommentsNode {
    const node = $createCommentsNode(serializedNode.comments, serializedNode.hash)
    return node
  }

  createDOM(): HTMLElement {
    return null
  }

  exportJSON(): SerializedCommentsNode {
    return {
      ...super.exportJSON(),
      type: 'comments',
      comments: this.getComments(),
      hash: this.getHash(),
      version: 1,
    }
  }

  getComments(): Comments {
    const self = this.getLatest()
    return self.__comments
  }

  setComments(comments: Comments): void {
    const writable = this.getWritable()
    writable.__comments = comments
  }

  getHash(): number {
    const self = this.getLatest()
    return self.__hash
  }

  decorate(): JSX.Element {
    return null
  }
}

export function $createCommentsNode(comments: Comments, hash: number): CommentsNode {
  return new CommentsNode(comments, hash)
}

export function $isCommentsNode(node: LexicalNode | null): node is CommentsNode {
  return node instanceof CommentsNode
}
