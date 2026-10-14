import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { EditorState, KEY_ESCAPE_COMMAND, LexicalEditor } from 'lexical'
import React, { useEffect } from 'react'
import CommentEditorTheme from '../CommentEditorTheme'
import ContentEditable from '../../../../lib/ui/ContentEditable'
import Placeholder from '../../../../lib/ui/Placeholder'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

const EscapeHandlerPlugin = ({ onEscape }: { onEscape: (e: KeyboardEvent) => boolean }): null => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event: KeyboardEvent) => {
        return onEscape(event)
      },
      2,
    )
  }, [editor, onEscape])

  return null
}

const PlainTextEditor = ({
  className,
  autoFocus,
  onEscape,
  onChange,
  editorRef,
  placeholder = 'Type a comment...',
}: {
  autoFocus?: boolean
  className?: string
  editorRef?: { current: null | LexicalEditor }
  onChange: (editorState: EditorState, editor: LexicalEditor) => void
  onEscape: (e: KeyboardEvent) => boolean
  placeholder?: string
}) => {
  const initialConfig = {
    namespace: 'Commenting',
    nodes: [],
    onError: (error: Error) => {
      throw error
    },
    theme: CommentEditorTheme,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="CommentPlugin_CommentInputBox_EditorContainer">
        <PlainTextPlugin
          contentEditable={<ContentEditable className={className} />}
          placeholder={<Placeholder>{placeholder}</Placeholder>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        {autoFocus !== false && <AutoFocusPlugin />}
        <EscapeHandlerPlugin onEscape={onEscape} />
        <ClearEditorPlugin />
        {editorRef !== undefined && <EditorRefPlugin editorRef={editorRef} />}
      </div>
    </LexicalComposer>
  )
}

export default PlainTextEditor
