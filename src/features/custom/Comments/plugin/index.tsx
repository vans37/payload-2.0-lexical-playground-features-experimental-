import type { LexicalCommand, NodeKey, RangeSelection } from 'lexical'
import './index.css'
import {
  $createMarkNode,
  $isMarkNode,
  MarkNode,
  $getMarkIDs,
  $unwrapMarkNode,
  $wrapSelectionInMarkNode,
} from '../nodes'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister, registerNestedElementResolver } from '@lexical/utils'
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import Button from '../../../../features/lib/ui/Button'
import cyrb53 from './hash'

import { getCommentsFromCollection, prepareCommentsCollection, saveComments } from './comments'
import { CommentStore, Thread, Comment, triggerOnChange, useCommentStore } from '../commenting'
import { useConfig, useDocumentInfo } from 'payload/components/utilities'
import CommentInputBox from './components/CommentInputBox'
import AddCommentBox from './components/AddCommentBox'
import CommentsPanel from './components/panel/CommentsPanel'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { CommentsFeatureProps } from '..'

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand('INSERT_INLINE_COMMAND')

export default function CommentPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [okToProceed, setOkToProceed] = useState(false)
  const commentStore = useMemo(() => new CommentStore(editor), [editor])
  const comments = useCommentStore(commentStore)
  const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => {
    return new Map()
  }, [])
  const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>()
  const [activeIDs, setActiveIDs] = useState<Array<string>>([])
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const {
    routes: { api },
    collections,
  } = useConfig()

  const { editorConfig } = useEditorConfigContext()

  //comments
  const { collection, id } = useDocumentInfo()

  const collectionSlug = (
    editorConfig.resolvedFeatureMap.get('comments')?.props as CommentsFeatureProps
  )?.collection

  const hash = useMemo(() => {
    if (id) {
      const combined = collection.slug + id.toString()
      const hash = cyrb53(combined)

      return hash
    }

    return null
  }, [collection, id])

  useEffect(() => {
    const setUpComments = async () => {
      if (collection?.slug) {
        if (hash) {
          const ready = await prepareCommentsCollection(collections, hash, api, collectionSlug)

          // if (!ready) {
          //   console.error(`Could not prepare collection ${collectionSlug}`)
          //   setOkToProceed(false)
          //   return
          // }

          const commentsSerialized = await getCommentsFromCollection(hash)
          if (commentsSerialized || commentsSerialized?.length > 0) {
            const parsedCommentsArr: Comment[] = JSON.parse(commentsSerialized)
            commentStore.setComments(parsedCommentsArr)
            triggerOnChange(commentStore)
          }
          setOkToProceed(true)
        }
      }
    }
    void setUpComments()
  }, [collection?.slug, commentStore, hash])

  const cancelAddComment = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      // Restore selection
      if (selection !== null) {
        selection.dirty = true
      }
    })
    setShowCommentInput(false)
  }, [editor])

  const deleteCommentOrThread = useCallback(
    (comment: Comment | Thread, thread?: Thread) => {
      if (comment.type === 'comment') {
        const deletionInfo = commentStore.deleteCommentOrThread(comment, thread)
        if (!deletionInfo) {
          return
        }
        const { markedComment, index } = deletionInfo
        commentStore.addComment(markedComment, thread, index)
        // saveComments(commentStore, hash, api, collectionSlug)
      } else {
        commentStore.deleteCommentOrThread(comment)
        // saveComments(commentStore, hash, api, collectionSlug)
        // Remove ids from associated marks
        const id = thread !== undefined ? thread.id : comment.id
        const markNodeKeys = markNodeMap.get(id)
        if (markNodeKeys !== undefined) {
          // Do async to avoid causing a React infinite loop
          setTimeout(() => {
            editor.update(() => {
              for (const key of markNodeKeys) {
                const node: null | MarkNode = $getNodeByKey(key)
                if ($isMarkNode(node)) {
                  node.deleteID(id)
                  if (node.getIDs().length === 0) {
                    $unwrapMarkNode(node)
                  }
                }
              }
            })
          })
        }
      }
    },
    [commentStore, editor, hash, markNodeMap],
  )

  const submitAddComment = useCallback(
    (
      commentOrThread: Comment | Thread,
      isInlineComment: boolean,
      thread?: Thread,
      selection?: RangeSelection | null,
    ) => {
      commentStore.addComment(commentOrThread, thread)
      // saveComments(commentStore, hash, api, collectionSlug)

      if (isInlineComment) {
        editor.update(() => {
          if ($isRangeSelection(selection)) {
            const isBackward = selection.isBackward()
            const id = commentOrThread.id
            // Wrap content in a MarkNode
            $wrapSelectionInMarkNode(selection, isBackward, id)
          }
        })
        setShowCommentInput(false)
      }
    },
    [commentStore, editor, hash],
  )

  useEffect(() => {
    const changedElems: Array<HTMLElement> = []
    for (let i = 0; i < activeIDs.length; i++) {
      const id = activeIDs[i]
      const keys = markNodeMap.get(id)
      if (keys !== undefined) {
        for (const key of keys) {
          const elem = editor.getElementByKey(key)
          if (elem !== null) {
            elem.classList.add('selected')
            changedElems.push(elem)
            setShowComments(true)
          }
        }
      }
    }
    return () => {
      for (let i = 0; i < changedElems.length; i++) {
        const changedElem = changedElems[i]
        changedElem.classList.remove('selected')
      }
    }
  }, [activeIDs, editor, markNodeMap])

  useEffect(() => {
    const markNodeKeysToIDs: Map<NodeKey, Array<string>> = new Map()

    return mergeRegister(
      registerNestedElementResolver<MarkNode>(
        editor,
        MarkNode,
        (from: MarkNode) => {
          return $createMarkNode(from.getIDs())
        },
        (from: MarkNode, to: MarkNode) => {
          // Merge the IDs
          const ids = from.getIDs()
          ids.forEach((id) => {
            to.addID(id)
          })
        },
      ),
      editor.registerMutationListener(MarkNode, (mutations) => {
        editor.getEditorState().read(() => {
          for (const [key, mutation] of mutations) {
            const node: null | MarkNode = $getNodeByKey(key)
            let ids: NodeKey[] = []

            if (mutation === 'destroyed') {
              ids = markNodeKeysToIDs.get(key) || []
            } else if ($isMarkNode(node)) {
              ids = node.getIDs()
            }

            for (let i = 0; i < ids.length; i++) {
              const id = ids[i]
              let markNodeKeys = markNodeMap.get(id)
              markNodeKeysToIDs.set(key, ids)

              if (mutation === 'destroyed') {
                if (markNodeKeys !== undefined) {
                  markNodeKeys.delete(key)
                  if (markNodeKeys.size === 0) {
                    markNodeMap.delete(id)
                  }
                }
              } else {
                if (markNodeKeys === undefined) {
                  markNodeKeys = new Set()
                  markNodeMap.set(id, markNodeKeys)
                }
                if (!markNodeKeys.has(key)) {
                  markNodeKeys.add(key)
                }
              }
            }
          }
        })
      }),
      editor.registerUpdateListener(({ editorState, tags }) => {
        editorState.read(() => {
          const selection = $getSelection()
          let hasActiveIds = false
          let hasAnchorKey = false

          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode()

            if ($isTextNode(anchorNode)) {
              const commentIDs = $getMarkIDs(anchorNode, selection.anchor.offset)
              if (commentIDs !== null) {
                setActiveIDs(commentIDs)
                hasActiveIds = true
              }
              if (!selection.isCollapsed()) {
                setActiveAnchorKey(anchorNode.getKey())
                hasAnchorKey = true
              }
            }
          }
          if (!hasActiveIds) {
            setActiveIDs((_activeIds) => (_activeIds.length === 0 ? _activeIds : []))
          }
          if (!hasAnchorKey) {
            setActiveAnchorKey(null)
          }
          if (!tags.has('collaboration') && $isRangeSelection(selection)) {
            setShowCommentInput(false)
          }
        })
      }),
      editor.registerCommand(
        INSERT_INLINE_COMMAND,
        () => {
          const domSelection = window.getSelection()
          if (domSelection !== null) {
            domSelection.removeAllRanges()
          }
          setShowCommentInput(true)
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor, markNodeMap])

  const onAddComment = () => {
    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)
  }

  if (okToProceed) {
    return (
      <React.Fragment>
        {showCommentInput &&
          createPortal(
            <CommentInputBox
              editor={editor}
              cancelAddComment={cancelAddComment}
              submitAddComment={submitAddComment}
            />,
            document.body,
          )}
        {activeAnchorKey !== null &&
          activeAnchorKey !== undefined &&
          !showCommentInput &&
          createPortal(
            <AddCommentBox
              anchorKey={activeAnchorKey}
              editor={editor}
              onAddComment={onAddComment}
            />,
            document.body,
          )}
        {createPortal(
          <Button
            className={`CommentPlugin_ShowCommentsButton ${showComments ? 'active' : ''}`}
            onClick={() => setShowComments(!showComments)}
            title={showComments ? 'Hide Comments' : 'Show Comments'}
          >
            <i className="comments" />
          </Button>,
          document.body,
        )}
        {showComments &&
          createPortal(
            <CommentsPanel
              comments={comments}
              submitAddComment={submitAddComment}
              deleteCommentOrThread={deleteCommentOrThread}
              activeIDs={activeIDs}
              markNodeMap={markNodeMap}
            />,
            document.body,
          )}
      </React.Fragment>
    )
  } else {
    return null
  }
}
