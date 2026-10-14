import { useRef, useState } from 'react'
import { createComment, Thread, Comment } from '../../commenting'
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from 'lexical'

import React from 'react'
import PlainTextEditor from './PlainTextEditor'
import { Button } from 'payload/components'
import { useCollabAuthorName, useOnChange } from '../hooks'

const CommentsComposer = ({
  submitAddComment,
  thread,
  placeholder,
}: {
  placeholder?: string
  submitAddComment: (
    commentOrThread: Comment,
    isInlineComment: boolean,
    // eslint-disable-next-line no-shadow
    thread?: Thread,
  ) => void
  thread?: Thread
}) => {
  const [content, setContent] = useState('')
  const [canSubmit, setCanSubmit] = useState(false)
  const editorRef = useRef<LexicalEditor>(null)
  const author = useCollabAuthorName()

  const onChange = useOnChange(setContent, setCanSubmit)

  const submitComment = () => {
    if (canSubmit) {
      submitAddComment(createComment(content, author), false, thread)
      const editor = editorRef.current
      if (editor !== null) {
        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
      }
    }
  }

  return (
    <React.Fragment>
      <PlainTextEditor
        className="CommentPlugin_CommentsPanel_Editor"
        autoFocus={false}
        onEscape={() => {
          return true
        }}
        onChange={onChange}
        editorRef={editorRef}
        placeholder={placeholder}
      />
      <Button
        className="CommentPlugin_CommentsPanel_SendButton"
        onClick={submitComment}
        disabled={!canSubmit}
      >
        <i className="send" />
      </Button>
    </React.Fragment>
  )
}

export default CommentsComposer
