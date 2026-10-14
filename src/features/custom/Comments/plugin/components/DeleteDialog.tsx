import React from 'react'
import { Thread, Comment } from '../../commenting'
import { Button } from 'payload/components'

const ShowDeleteCommentOrThreadDialog = ({
  commentOrThread,
  deleteCommentOrThread,
  onClose,
  thread = undefined,
}: {
  commentOrThread: Comment | Thread

  deleteCommentOrThread: (
    comment: Comment | Thread,
    // eslint-disable-next-line no-shadow
    thread?: Thread,
  ) => void
  onClose: () => void
  thread?: Thread
}): JSX.Element => {
  return (
    <React.Fragment>
      Are you sure you want to delete this {commentOrThread.type}?
      <div className="Modal__content">
        <Button
          onClick={() => {
            deleteCommentOrThread(commentOrThread, thread)
            onClose()
          }}
        >
          Delete
        </Button>{' '}
        <Button
          onClick={() => {
            onClose()
          }}
        >
          Cancel
        </Button>
      </div>
    </React.Fragment>
  )
}

export default ShowDeleteCommentOrThreadDialog
