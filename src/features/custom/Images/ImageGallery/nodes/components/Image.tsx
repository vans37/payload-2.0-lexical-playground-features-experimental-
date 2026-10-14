import type { BaseSelection, LexicalCommand, NodeKey } from 'lexical'
import './image.scss'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import * as React from 'react'
import { Suspense, useCallback, useEffect, useRef, useState, forwardRef } from 'react'
import { $isGalleryImageNode } from '../ImageNode'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'

import { $isGalleryNode } from '../GalleryNode'
import { GalleryFeatureProps } from '../..'
import { Button } from 'payload/components'
import { ImageDataType } from '../../../Shared/types'
import getImageSrc from '../../../Shared/getImageSrc'
import { useGallery } from '../../store'

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> = createCommand(
  'RIGHT_CLICK_IMAGE_COMMAND',
)

const DecoratorImage = forwardRef<
  HTMLImageElement,
  {
    altText: string
    className: string | null
    height: 'inherit' | number
    maxWidth: number
    src: string
    width: 'inherit' | number
  }
>(function ImageComponent({ altText, className, src, width, height, maxWidth }, ref): JSX.Element {
  //don't use lazy image, it will defer setting image ref
  //and will cause some initial interactions like deletion etc. not to work
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={ref}
      style={{
        height,
        maxWidth,
        width,
      }}
      draggable="false"
    />
  )
})

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  caption,
  mimetype,
  belongsTo,
  galleryKey,
  fileData,
}: {
  altText: string
  caption: string
  height: number
  maxWidth: number
  nodeKey: NodeKey
  src: string
  width: number
  mimetype: string
  belongsTo: string
  galleryKey: NodeKey
  fileData: ImageDataType
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [editor] = useLexicalComposerContext()
  const [selection, setSelection] = useState<BaseSelection | null>(null)
  const [imgSrc, setImgSrc] = useState(src)
  const [captionText, setCaptionText] = useState(caption)
  const [editCaption, setEditCaption] = useState(false)
  const [historyCaption, setHistoryCaption] = useState('')

  const { deleteSelectionBySlugAndId, deleteFile, setShouldInsertMedia } = useGallery(galleryKey)

  const { editorConfig } = useEditorConfigContext()

  const { collections } = editorConfig?.resolvedFeatureMap?.get('gallery')
    ?.props as GalleryFeatureProps

  const collection = collections[belongsTo]

  useEffect(() => {
    editor.update(() => {
      const gallery = $getNodeByKey(galleryKey)
      if (gallery && $isGalleryNode(gallery)) {
        gallery.setIsHighlighted(isSelected)
      }
    })
  }, [isSelected])

  useEffect(() => {
    if (fileData?.id) {
      const src = getImageSrc(
        fileData?.filename,
        collection.serverURL,
        collection.useCustomURL,
        belongsTo,
      )
      setImgSrc(src)
    }
  }, [fileData?.id, fileData?.filename, collection, belongsTo, getImageSrc, setImgSrc])

  const $deleteNode = useCallback((nodeKey: NodeKey) => {
    const node = $getNodeByKey(nodeKey)
    if ($isGalleryImageNode(node)) {
      const { fileData, belongsTo } = node.exportJSON()
      if (fileData?.id) {
        deleteSelectionBySlugAndId({ id: fileData?.id, collectionSlug: belongsTo }, galleryKey)
        node.remove()
      } else {
        deleteFile(node.getSrc())
        node.remove()
      }
      return true
    }
  }, [])

  //if its an upload, delete selection then node
  //else delete a file then node
  const handleDelete = useCallback(() => {
    editor.update(() => {
      $deleteNode(nodeKey)
    })
  }, [deleteFile, deleteSelectionBySlugAndId, editor, nodeKey, setShouldInsertMedia])

  //delete via escape/delete key
  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload
        event.preventDefault()
        $deleteNode(nodeKey)
      }
      return false
    },
    [isSelected, nodeKey, deleteFile],
  )

  const onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection()
      const buttonElem = buttonRef.current
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault()
          buttonElem.focus()
          return true
        }
      }
      return false
    },
    [isSelected],
  )

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (buttonRef.current === event.target) {
        $setSelection(null)
        editor.update(() => {
          setSelected(true)
          setEditCaption(false)
          const parentRootElement = editor.getRootElement()
          if (parentRootElement !== null) {
            parentRootElement.focus()
          }
        })
        return true
      }
      return false
    },
    [editor, setSelected],
  )

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload

      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected)
          setEditCaption(false)
        } else {
          clearSelection()
          setSelected(true)
          setEditCaption(false)
        }
        return true
      }

      return false
    },
    [isSelected, setSelected, clearSelection],
  )

  const onRightClick = useCallback(
    (event: MouseEvent): void => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection()
        const domElement = event.target as HTMLElement
        if (
          domElement.tagName === 'IMG' &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event)
        }
      })
    },
    [editor],
  )

  useEffect(() => {
    let isMounted = true
    const rootElement = editor.getRootElement()
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()))
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection()
          if (selection) {
            const nodes = selection.getNodes()
            nodes.forEach((node) => {
              if (node.__key === nodeKey) {
                setSelected(true)
              }
            })
          }

          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand<MouseEvent>(RIGHT_CLICK_IMAGE_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault()
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW),
    )

    rootElement?.addEventListener('contextmenu', onRightClick)

    return () => {
      isMounted = false
      unregister()
      rootElement?.removeEventListener('contextmenu', onRightClick)
    }
  }, [editor, onClick, onDelete, onEnter, onEscape, onRightClick])

  const draggable = isSelected && $isNodeSelection(selection)
  const isFocused = isSelected

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaptionText(e.currentTarget.value)
  }

  const handleSetCaption = () => {
    if (captionText?.length === 0) {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isGalleryImageNode(node)) {
          node.setCaption('')
          setEditCaption(false)
        }
      })
    } else {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isGalleryImageNode(node)) {
          node.setCaption(captionText)
          setEditCaption(false)
        }
      })
    }
  }

  const handleClearCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isGalleryImageNode(node)) {
        node.setCaption('')
        setHistoryCaption(captionText)
        setCaptionText('')
      }
    })
  }

  const handleRestoreCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isGalleryImageNode(node)) {
        node.setCaption(historyCaption)
        setCaptionText(historyCaption)
        setHistoryCaption('')
      }
    })
  }

  return (
    <Suspense fallback={null}>
      <React.Fragment>
        <div className="gallery-image" draggable={draggable}>
          <DecoratorImage
            className={
              isFocused ? `focused  ${$isNodeSelection(selection) ? 'draggable' : ''}` : null
            }
            src={imgSrc}
            altText={altText}
            ref={imageRef}
            width={width}
            height={height}
            maxWidth={maxWidth}
          />

          <div
            className="delete-image"
            aria-label="delete"
            tabIndex={0}
            role="button"
            onClick={handleDelete}
          >
            &#10006;
          </div>

          {belongsTo?.length > 0 && <div className="upload-type">{belongsTo}</div>}

          {!belongsTo && <div className="upload-type">File/base64</div>}

          {captionText?.length > 0 && (
            <div
              className="caption-text"
              tabIndex={0}
              aria-label="edit caption text"
              role="button"
              onClick={() => setEditCaption(true)}
            >
              <span>Caption: {captionText}</span>
            </div>
          )}

          {editCaption && (
            <div className="edit-caption">
              <div className="edit-area">
                <textarea onChange={(e) => handleChange(e)} value={captionText} />
                {captionText?.length > 0 && (
                  <React.Fragment>
                    <Button className="action-btn" onClick={handleSetCaption}>
                      Confirm
                    </Button>
                    <Button className="action-btn" onClick={handleClearCaption}>
                      Clear
                    </Button>
                  </React.Fragment>
                )}
                {historyCaption.length > 0 && (
                  <Button className="action-btn" onClick={handleRestoreCaption}>
                    Undo
                  </Button>
                )}
                <Button className="action-btn" onClick={() => setEditCaption(false)}>
                  Exit
                </Button>
              </div>
            </div>
          )}

          {isFocused && caption.length === 0 && !editCaption && (
            <div>
              <Button
                className="add-caption-btn"
                onClick={() => {
                  setEditCaption(true)
                }}
              >
                Add Caption
              </Button>
            </div>
          )}
        </div>
      </React.Fragment>
    </Suspense>
  )
}
