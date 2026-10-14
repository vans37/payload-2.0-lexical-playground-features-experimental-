import { $getNodeByKey, NodeKey } from 'lexical'
import { Comments, Thread, Comment } from '../../../commenting'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useMemo, useState } from 'react'
import useModal from '../../../../../lib/hooks/useModal'
import { $isMarkNode, MarkNode } from '../../../nodes'
import React from 'react'
import { Button } from 'payload/components'
import ShowDeleteCommentOrThreadDialog from '../DeleteDialog'
import CommentsPanelListComment from './CommentsPanelListComment'
import CommentsComposer from '../CommentsComposer'

const CommentsPanelList = ({
  activeIDs,
  comments,
  deleteCommentOrThread,
  listRef,
  submitAddComment,
  markNodeMap,
}: {
  activeIDs: Array<string>
  comments: Comments
  deleteCommentOrThread: (commentOrThread: Comment | Thread, thread?: Thread) => void
  listRef: { current: null | HTMLUListElement }
  markNodeMap: Map<string, Set<NodeKey>>
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread,
  ) => void
}): JSX.Element => {
  const [editor] = useLexicalComposerContext()
  const [counter, setCounter] = useState(0)
  const [modal, showModal] = useModal()
  const rtf = useMemo(
    () =>
      new Intl.RelativeTimeFormat('en', {
        localeMatcher: 'best fit',
        numeric: 'auto',
        style: 'short',
      }),
    [],
  )

  useEffect(() => {
    // Used to keep the time stamp up to date
    const id = setTimeout(() => {
      setCounter(counter + 1)
    }, 10000)

    return () => {
      clearTimeout(id)
    }
  }, [counter])

  if (!comments || Object.keys(comments).length === 0) {
    return null
  }

  return (
    <ul className="CommentPlugin_CommentsPanel_List" ref={listRef}>
      {comments.map((commentOrThread) => {
        const id = commentOrThread.id
        if (commentOrThread.type === 'thread') {
          const handleClickThread = () => {
            const markNodeKeys = markNodeMap.get(id)
            if (
              markNodeKeys !== undefined &&
              (activeIDs === null || activeIDs.indexOf(id) === -1)
            ) {
              const activeElement = document.activeElement
              // Move selection to the start of the mark, so that we
              // update the UI with the selected thread.
              editor.update(
                () => {
                  const markNodeKey = Array.from(markNodeKeys)[0]
                  const markNode = $getNodeByKey<MarkNode>(markNodeKey)
                  if ($isMarkNode(markNode)) {
                    markNode.selectStart()
                  }
                },
                {
                  onUpdate() {
                    // Restore selection to the previous element
                    if (activeElement !== null) {
                      ;(activeElement as HTMLElement).focus()
                    }
                  },
                },
              )
            }
          }

          return (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li
              key={id}
              onClick={handleClickThread}
              className={`CommentPlugin_CommentsPanel_List_Thread ${
                markNodeMap.has(id) ? 'interactive' : ''
              } ${activeIDs.indexOf(id) === -1 ? '' : 'active'}`}
            >
              <div className="CommentPlugin_CommentsPanel_List_Thread_QuoteBox">
                <blockquote className="CommentPlugin_CommentsPanel_List_Thread_Quote">
                  {'> '}
                  <span>{commentOrThread.quote}</span>
                </blockquote>
                {/* INTRODUCE DELETE THREAD HERE*/}
                <Button
                  onClick={() => {
                    showModal('Delete Thread', (onClose) => (
                      <ShowDeleteCommentOrThreadDialog
                        commentOrThread={commentOrThread}
                        deleteCommentOrThread={deleteCommentOrThread}
                        onClose={onClose}
                      />
                    ))
                  }}
                  className="CommentPlugin_CommentsPanel_List_DeleteButton"
                >
                  <i className="delete" />
                </Button>
                {modal}
              </div>
              <ul className="CommentPlugin_CommentsPanel_List_Thread_Comments">
                {commentOrThread.comments.map((comment) => (
                  <CommentsPanelListComment
                    key={comment.id}
                    comment={comment}
                    deleteComment={deleteCommentOrThread}
                    thread={commentOrThread}
                    rtf={rtf}
                  />
                ))}
              </ul>
              <div className="CommentPlugin_CommentsPanel_List_Thread_Editor">
                <CommentsComposer
                  submitAddComment={submitAddComment}
                  thread={commentOrThread}
                  placeholder="Reply to comment..."
                />
              </div>
            </li>
          )
        }
        return (
          <CommentsPanelListComment
            key={id}
            comment={commentOrThread}
            deleteComment={deleteCommentOrThread}
            rtf={rtf}
          />
        )
      })}
    </ul>
  )
}

export default CommentsPanelList
