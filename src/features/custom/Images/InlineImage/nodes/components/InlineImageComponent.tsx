import './InlineImageNode.scss'
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { EditInlineImage } from './Edit'
import { Button, Drawer } from 'payload/components/elements'
import { $isInlineImageNode, Position } from '../InlineImageNode'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { useModal } from '@faceless-ui/modal'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { useTranslation } from 'react-i18next'
import { mergeRegister } from '@lexical/utils'
import { InlineImageFeatureProps } from '../..'
import { ImageDataType } from '../../../Shared/types'
import getImageSrc from '../../../Shared/getImageSrc'

const imageCache = new Set()

const useSuspenseImage = (src: string) => {
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

const LazyImage = ({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  position,
}: {
  altText: string
  className: string | null
  height: 'inherit' | number
  imageRef: { current: null | HTMLImageElement }
  src: string
  width: 'inherit' | number
  position: Position
}): JSX.Element => {
  useSuspenseImage(src)

  return (
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      data-position={position}
      style={{
        display: 'block',
        height,
        width,
      }}
      draggable="false"
    />
  )
}

export default function InlineImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  position,
  isWebUploadable,
  belongsTo,
  fileData,
}: {
  altText: string
  height: 'inherit' | number
  nodeKey: NodeKey
  src: string
  width: 'inherit' | number
  position: Position
  belongsTo: string
  isWebUploadable: boolean
  fileData: ImageDataType
}): JSX.Element {
  const { toggleModal } = useModal()
  const imageRef = useRef<null | HTMLImageElement>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [editor] = useLexicalComposerContext()
  const [selection, setSelection] = useState<BaseSelection | null>(null)
  const [imgSrc, setImgSrc] = useState(src)
  const [isUploadable, setIsUploadable] = useState(isWebUploadable)
  const { editorConfig } = useEditorConfigContext()
  const activeEditorRef = useRef<LexicalEditor | null>(null)
  const { t } = useTranslation('inline_image')
  const drawerSlug = `inline_image_edit_drawer`

  const $onDelete = useCallback(
    (payload: KeyboardEvent) => {
      const deleteSelection = $getSelection()
      if (isSelected && $isNodeSelection(deleteSelection)) {
        const event: KeyboardEvent = payload
        event.preventDefault()
        if (isSelected && $isNodeSelection(deleteSelection)) {
          editor.update(() => {
            deleteSelection.getNodes().forEach((node) => {
              if ($isInlineImageNode(node)) {
                node.remove()
              }
            })
          })
        }
      }
      return false
    },
    [editor, isSelected],
  )

  const $onEnter = useCallback(
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

  const $onEscape = useCallback(
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

  const serverURL = useRef(
    (editorConfig?.resolvedFeatureMap?.get('inline_images')?.props as InlineImageFeatureProps)
      ?.origin,
  )

  useEffect(() => {
    if (fileData?.id) {
      const src = getImageSrc(fileData?.filename, serverURL.current, false, belongsTo)
      setImgSrc(src)
    }
  }, [fileData?.id, fileData?.filename, serverURL.current, belongsTo, setImgSrc, getImageSrc])

  useEffect(() => {
    let isMounted = true
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
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload
          if (event.target === imageRef.current) {
            if (event.shiftKey) {
              setSelected(!isSelected)
            } else {
              clearSelection()
              setSelected(true)
            }
            return true
          }

          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
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
      editor.registerCommand(KEY_DELETE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, $onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, $onEscape, COMMAND_PRIORITY_LOW),
    )
    return () => {
      isMounted = false
      unregister()
    }
  }, [clearSelection, editor, isSelected, nodeKey, $onDelete, $onEnter, $onEscape, setSelected])

  const handleOnChange = (value: boolean) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)

      if ($isInlineImageNode(node)) {
        node.setIsWebUploadable(value)
        setIsUploadable(value)
      }
    })
  }

  const draggable = isSelected && $isNodeSelection(selection)
  const isFocused = isSelected
  return (
    <Suspense fallback={null}>
      <>
        <span draggable={draggable}>
          <Button
            className="image-edit-button"
            ref={buttonRef}
            onClick={() => toggleModal(drawerSlug)}
          >
            {t('edit')}
          </Button>
          <LazyImage
            className={
              isFocused ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}` : null
            }
            src={src}
            altText={altText}
            imageRef={imageRef}
            width={width}
            height={height}
            position={position}
          />
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
              <span>{t('upload_to_collection')}</span>
              <input
                type="checkbox"
                checked={isUploadable}
                onChange={() => handleOnChange(!isUploadable)}
              />
            </div>
          )}
        </span>
      </>
      <Drawer slug={drawerSlug}>
        <EditInlineImage
          activeEditor={editor}
          nodeKey={nodeKey}
          toggleDrawer={toggleModal}
          drawerSlug={drawerSlug}
        />
      </Drawer>
    </Suspense>
  )
}
