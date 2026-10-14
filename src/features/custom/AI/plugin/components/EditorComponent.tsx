import * as React from 'react'
import { useEffect } from 'react'
import { ListItemNode, ListNode } from '@lexical/list'
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { HeadingNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { LinkNode } from '@payloadcms/richtext-lexical'
import { $createParagraphNode, $getRoot, $isParagraphNode, ParagraphNode, TextNode } from 'lexical'

//New editor instance to display formatted data to the user. Editing is forbidden.
const ModelResponseEditor = ({ markdown, isStream }: { markdown: string; isStream: boolean }) => {
  const editorConfig = {
    namespace: 'ai-nested-editor',
    nodes: [
      TextNode,
      ParagraphNode,
      LinkNode,
      ListNode,
      ListItemNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HeadingNode,
    ],
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    },
  }

  return (
    <div className="ai-nested-editor">
      <LexicalComposer initialConfig={editorConfig}>
        <AutoFocusPlugin />
        <PlainTextPlugin
          contentEditable={<ContentEditable className="ai-nested-editor-content" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ControlPlugin markdown={markdown} isStream={isStream} />
      </LexicalComposer>
    </div>
  )
}

const ControlPlugin = ({ markdown, isStream }: { markdown: string; isStream: boolean }) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.update(() => {
      //disable editing, editor is used for displaying data only
      editor.setEditable(false)
      const root = $getRoot()
      const parentNode = $createParagraphNode()
      root.append(parentNode)
    })
  }, [editor])

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot()
      const children = root.getChildren()

      if (children && children.length > 0) {
        const parent = children[0]
        if ($isParagraphNode(parent)) {
          //clear editor on each new content chunk so that prev content
          //wasn't concatinated with newer one
          if (isStream) {
            parent.clear()
          }
          $convertFromMarkdownString(markdown, TRANSFORMERS, parent)
        }
      }
    })
  }, [editor, isStream, markdown])

  return null
}

export default ModelResponseEditor
