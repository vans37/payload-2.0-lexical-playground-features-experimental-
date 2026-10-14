import { NodeKey } from 'lexical'
import { Comments, Thread, Comment } from '../../../commenting'
import { useRef } from 'react'
import React from 'react'
import CommentsPanelList from './CommentsPanelList'

const CommentsPanel = ({
  activeIDs,
  deleteCommentOrThread,
  comments,
  submitAddComment,
  markNodeMap,
}: {
  activeIDs: Array<string>
  comments: Comments
  deleteCommentOrThread: (commentOrThread: Comment | Thread, thread?: Thread) => void
  markNodeMap: Map<string, Set<NodeKey>>
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread,
  ) => void
}): JSX.Element => {
  const listRef = useRef<HTMLUListElement>(null)
  const isEmpty = comments.length === 0

  return (
    <div className="CommentPlugin_CommentsPanel">
      <h2 className="CommentPlugin_CommentsPanel_Heading">Comments</h2>
      {isEmpty ? (
        <div className="CommentPlugin_CommentsPanel_Empty">No Comments</div>
      ) : (
        <CommentsPanelList
          activeIDs={activeIDs}
          comments={comments}
          deleteCommentOrThread={deleteCommentOrThread}
          listRef={listRef}
          submitAddComment={submitAddComment}
          markNodeMap={markNodeMap}
        />
      )}
    </div>
  )
}

export default CommentsPanel
