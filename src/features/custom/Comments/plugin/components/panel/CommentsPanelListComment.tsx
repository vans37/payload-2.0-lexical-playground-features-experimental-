import React from 'react'
import useModal from '../../../../../lib/hooks/useModal'
import { Thread, Comment } from '../../../commenting'
import { Button } from 'payload/components'
import ShowDeleteCommentOrThreadDialog from '../DeleteDialog'

const CommentsPanelListComment = ({
  comment,
  deleteComment,
  thread,
  rtf,
}: {
  comment: Comment
  deleteComment: (
    commentOrThread: Comment | Thread,
    // eslint-disable-next-line no-shadow
    thread?: Thread,
  ) => void
  rtf: Intl.RelativeTimeFormat
  thread?: Thread
}): JSX.Element => {
  const seconds = Math.round((comment.timeStamp - performance.now()) / 1000)
  const minutes = Math.round(seconds / 60)
  const [modal, showModal] = useModal()

  return (
    <li className="CommentPlugin_CommentsPanel_List_Comment">
      <div className="CommentPlugin_CommentsPanel_List_Details">
        <span className="CommentPlugin_CommentsPanel_List_Comment_Author">{comment.author}</span>
        <span className="CommentPlugin_CommentsPanel_List_Comment_Time">
          · {seconds > -10 ? 'Just now' : rtf.format(minutes, 'minute')}
        </span>
      </div>
      <p className={comment.deleted ? 'CommentPlugin_CommentsPanel_DeletedComment' : ''}>
        {comment.content}
      </p>
      {!comment.deleted && (
        <React.Fragment>
          <Button
            onClick={() => {
              showModal('Delete Comment', (onClose) => (
                <ShowDeleteCommentOrThreadDialog
                  commentOrThread={comment}
                  deleteCommentOrThread={deleteComment}
                  thread={thread}
                  onClose={onClose}
                />
              ))
            }}
            className="CommentPlugin_CommentsPanel_List_DeleteButton"
          >
            <i className="delete" />
          </Button>
          {modal}
        </React.Fragment>
      )}
    </li>
  )
}

export default CommentsPanelListComment
