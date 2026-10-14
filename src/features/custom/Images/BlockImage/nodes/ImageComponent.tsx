import * as React from 'react'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import type { BaseSelection, LexicalCommand, LexicalEditor, NodeKey } from 'lexical'
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

import { $isImageNode } from './ImageNode'

import './ImageNode.css'

import { useConfig } from 'payload/components/utilities'
import { BlockImageFeatureProps } from '..'
import ImageResizer from '../../../../lib/ui/ImageResizer'
import { ImageDataType } from '../../Shared/types'
import ViewFileData from '../../Shared/Components/ViewFileData/ViewFileData'
import getImageSrc from '../../Shared/getImageSrc'
import { useGlobalConfig } from '../../../../../globalStore'

const imageCache = new Set()

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> = createCommand(
  'RIGHT_CLICK_IMAGE_COMMAND',
)

function useSuspenseImage(src: string) {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        imageCache.add(src)
        resolve(null)
      }
    })
  }
}

function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  maxWidth,
}: {
  altText: string
  className: string | null
  height: 'inherit' | number
  imageRef: { current: null | HTMLImageElement }
  maxWidth: number
  src: string
  width: 'inherit' | number
}): JSX.Element {
  useSuspenseImage(src)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      style={{
        height,
        maxWidth,
        width,
        position: 'relative',
      }}
      draggable="false"
    />
  )
}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  showCaption,
  caption,
  captionsEnabled,
  isWebUploadable,
  fileData,
}: {
  altText: string
  caption: string
  height: 'inherit' | number
  maxWidth: number
  nodeKey: NodeKey
  resizable: boolean
  showCaption: boolean
  src: string
  width: 'inherit' | number
  captionsEnabled: boolean
  isWebUploadable: boolean
  fileData: ImageDataType
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [isResizing, setIsResizing] = useState<boolean>(false)
  const [editor] = useLexicalComposerContext()
  const [selection, setSelection] = useState<BaseSelection | null>(null)
  const activeEditorRef = useRef<LexicalEditor | null>(null)
  const [imgSrc, setImgSrc] = useState(src)
  const [captionText, setCaptionText] = useState(caption)
  const [editCaption, setEditCaption] = useState(!showCaption)
  const [showAddCaptionBtn, setShowAddCaptionBtn] = useState(!showCaption)
  const [isUploadable, setIsUploadable] = useState(isWebUploadable)
  const { serverURL: serverURLFallback } = useConfig()
  const { editorConfig } = useEditorConfigContext()

  const serverURL = useRef(
    (editorConfig?.resolvedFeatureMap?.get('block-image')?.props as BlockImageFeatureProps)
      .serverURL || serverURLFallback,
  )

  const defaultLexicalConfig = useGlobalConfig((state) => state.defaultLexicalConfig)

  useEffect(() => {
    if (fileData?.id) {
      const src = getImageSrc(fileData?.filename, serverURL.current)
      console.log('src', src)
      setImgSrc(src)
    }
  }, [fileData?.id, fileData?.filename, serverURL.current, getImageSrc, setImgSrc])

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload
        event.preventDefault()
        const node = $getNodeByKey(nodeKey)
        if ($isImageNode(node)) {
          node.remove()
          return true
        }
      }
      return false
    },
    [isSelected, nodeKey],
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
        if (showCaption) {
          // Move focus into nested editor
          // $setSelection(null)
          // event.preventDefault()
          // caption.focus()
          // return true
        } else if (buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault()
          buttonElem.focus()
          return true
        }
      }
      return false
    },
    [isSelected, showCaption],
  )

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (buttonRef.current === event.target) {
        $setSelection(null)
        editor.update(() => {
          setSelected(true)
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

      if (isResizing) {
        return true
      }
      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected)
        } else {
          clearSelection()
          setSelected(true)
        }
        return false
      }

      return false
    },
    [isResizing, isSelected, setSelected, clearSelection],
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
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor
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
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    onDelete,
    onEnter,
    onEscape,
    onClick,
    onRightClick,
    setSelected,
  ])

  const setShowCaption = (show: boolean) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) {
        node.setShowCaption(show)
      }
    })
  }

  const onResizeEnd = (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false)
    }, 200)

    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight)
      }
    })
  }

  const onResizeStart = () => {
    setIsResizing(true)
  }

  const draggable = isSelected && $isNodeSelection(selection) && !isResizing
  const isFocused = isSelected || isResizing

  const handleIsUploadable = (value: boolean) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)

      if ($isImageNode(node)) {
        node.setIsWebUploadable(value)
        setIsUploadable(value)
      }
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptionText(e.currentTarget.value)
  }

  const setCaption = () => {
    if (captionText?.length === 0) {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey)
          if ($isImageNode(node)) {
            node.setCaption('')
            setShowCaption(false)
            setShowAddCaptionBtn(true)
            setEditCaption(false)
          }
        },
        { discrete: true },
      )
    } else {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey)
          if ($isImageNode(node)) {
            node.setCaption(captionText)
            setShowAddCaptionBtn(false)
            setShowCaption(true)
            setEditCaption(false)
          }
        },
        { discrete: true },
      )
    }
  }

  const handleSetCaption = () => {
    setCaption()
  }

  const handleClearCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isImageNode(node)) {
        node.setCaption('')
        setCaptionText('')
        setShowCaption(false)
        setShowAddCaptionBtn(true)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter' && captionText?.length > 0) {
      setCaption()
    }
  }

  return (
    <Suspense fallback={null}>
      <React.Fragment>
        <div style={{ position: 'relative' }} draggable={draggable}>
          <LazyImage
            className={
              isFocused ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}` : null
            }
            src={imgSrc}
            altText={altText}
            imageRef={imageRef}
            width={width}
            height={height}
            maxWidth={maxWidth}
          />
          <ViewFileData fileData={fileData} />
        </div>

        {/* isUploadable */}
        {imgSrc.startsWith('http') && !fileData?.id && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '4px',
              background: 'rgba(0, 0, 0, 1)',
              zIndex: '3',
              color: '#FFF',
              padding: '4px 8px',
              fontWeight: 'bolder',
            }}
          >
            <span>Upload: </span>
            <input
              type="checkbox"
              checked={isUploadable}
              onChange={() => handleIsUploadable(!isUploadable)}
            />
          </div>
        )}

        {captionText?.length > 0 && showCaption && !editCaption && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            onClick={() => setEditCaption(true)}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              bottom: '8px',
              left: '4px',
              background: 'rgba(0, 0, 0, 1)',
              zIndex: '3',
              color: '#FFF',
              padding: '4px 8px',
              fontWeight: 'bolder',
            }}
          >
            {captionText}
          </div>
        )}

        {!showAddCaptionBtn && editCaption && (
          <div className="image-edit-caption">
            <div style={{ position: 'relative', width: '100%', height: '3rem' }}>
              <input
                type="text"
                onKeyDown={(e) => handleKeyDown(e)}
                onChange={(e) => handleChange(e)}
                value={captionText}
                style={{
                  width: '100%',
                  height: 'inherit',
                }}
              />
              {(!captionText || captionText?.length === 0) && (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: 0,
                    cursor: 'pointer',
                    width: '1.5rem',
                    height: '3rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'rgba(220, 30, 45, 0.7)',
                  }}
                  onClick={() => {
                    setShowAddCaptionBtn(true)
                  }}
                >
                  &#215;
                </div>
              )}

              {captionText?.length > 0 && (
                <React.Fragment>
                  <div
                    tabIndex={0}
                    role="button"
                    style={{
                      position: 'absolute',
                      right: '3.25rem',
                      top: 0,
                      cursor: 'pointer',
                      width: '1.5rem',
                      height: '3rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'rgba(30, 220, 45, 0.7)',
                    }}
                    onClick={handleSetCaption}
                  >
                    &#10003;
                  </div>
                  <div
                    tabIndex={0}
                    role="button"
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: 0,
                      cursor: 'pointer',
                      width: '1.5rem',
                      height: '3rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'rgba(220, 30, 45, 0.7)',
                    }}
                    onClick={handleClearCaption}
                  >
                    &#10005;
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        )}

        {resizable && $isNodeSelection(selection) && isFocused && (
          <ImageResizer
            showCaption={showAddCaptionBtn}
            setShowCaption={setShowAddCaptionBtn}
            editor={editor}
            buttonRef={buttonRef}
            imageRef={imageRef}
            maxWidth={maxWidth}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
            captionsEnabled={captionsEnabled}
          />
        )}
      </React.Fragment>
    </Suspense>
  )
}
