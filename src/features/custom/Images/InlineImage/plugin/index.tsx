import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $wrapNodeInElement, mediaFileReader, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
} from 'lexical'
import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  $createInlineImageNode,
  $isInlineImageNode,
  InlineImageNode,
  InlineImagePayload,
  Position,
} from '../nodes/InlineImageNode'

import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { useModal } from '@faceless-ui/modal'
import { UploadDrawer } from './drawer'

import { useConfig } from 'payload/components/utilities'
import './index.scss'
import { CAN_USE_DOM } from '../../../../lib/shared/canUseDOM'
import SelectImageModal from '../../../Shared/SelectImageModal'
import Select from '../../../../lib/ui/Select/Select'

export type InsertInlineImagePayload = Readonly<InlineImagePayload>

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null

export const INSERT_INLINE_IMAGE_COMMAND: LexicalCommand<InlineImagePayload> = createCommand(
  'INSERT_INLINE_IMAGE_COMMAND',
)

export const TOGGLE_UPLOADS_DRAWER_COMMAND: LexicalCommand<boolean> = createCommand()

const ACCEPTABLE_IMAGE_TYPES = ['image/', 'image/heic', 'image/heif', 'image/gif', 'image/webp']

export default function InlineImagePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { field } = useEditorConfigContext()
  const { toggleModal } = useModal()
  const { collections } = useConfig()

  const [position, setPosition] = useState<Position>('left')

  const drawerSlug = `upload_drawer_slug_${field.path}`

  useEffect(() => {
    if (!editor.hasNodes([InlineImageNode])) {
      throw new Error('ImagesPlugin: ImageNode not registered on editor')
    }

    return mergeRegister(
      editor.registerCommand<InsertInlineImagePayload>(
        INSERT_INLINE_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createInlineImageNode(payload)
          $insertNodes([imageNode])
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
          }

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return $onDragStart(event)
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return $onDragover(event)
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return $onDrop(event, editor)
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        TOGGLE_UPLOADS_DRAWER_COMMAND,
        (payload) => {
          toggleModal(drawerSlug)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor])

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition(e.target.value as Position)
  }

  const toggleUploadsDrawer = useCallback(() => {
    toggleModal('test')
    editor.dispatchCommand(TOGGLE_UPLOADS_DRAWER_COMMAND, true)
  }, [editor])

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        const selectedFiles = Array.from(droppedFiles)
        const filesResult = await mediaFileReader(selectedFiles, ACCEPTABLE_IMAGE_TYPES)
        if (filesResult || filesResult.length > 0) {
          const file = filesResult[0]
          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) {
              return
            }
            const node = $createInlineImageNode({
              altText: '',
              position: position,
              src: file.result, // base64
              fileData: null,
              belongsTo: null,
              isWebUploadable: true,
            })
            selection.insertNodes([node])
          })
        }
        toggleModal(drawerSlug)
      }
    },
    [toggleModal, position, drawerSlug],
  )

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()
      const clipboardData = e.clipboardData.getData('text/html')
      const droppedFiles = e.clipboardData.files
      let src = ''

      //note that if user selected and copied multiple images
      //from web page, only first found image will be used
      if (clipboardData) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(clipboardData, 'text/html')
        const imgTag = doc.querySelector('img')
        if (imgTag) {
          src = imgTag.src
        }
      }

      //if img pasted from web
      if (src.length > 0) {
        editor.update(() => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) {
            return
          }
          const node = $createInlineImageNode({
            altText: '',
            position: position,
            src, // base64
            fileData: null,
            belongsTo: null,
            isWebUploadable: true,
          })
          selection.insertNodes([node])
        })
        toggleModal(drawerSlug)
        return
      } else if (droppedFiles.length > 0) {
        const selectedFiles = Array.from(droppedFiles)

        const filesResult = await mediaFileReader(selectedFiles, ACCEPTABLE_IMAGE_TYPES)

        if (filesResult || filesResult.length > 0) {
          const file = filesResult[0]
          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) {
              return
            }
            const node = $createInlineImageNode({
              altText: '',
              position: position,
              src: file.result, // base64
              fileData: null,
              belongsTo: null,
              isWebUploadable: true,
            })
            selection.insertNodes([node])
          })
        }
        toggleModal(drawerSlug)
      }
    },
    [position, toggleModal, drawerSlug],
  )

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        const arrFiles = Array.from(selectedFiles)
        const filesResult = await mediaFileReader(arrFiles, ACCEPTABLE_IMAGE_TYPES)
        if (filesResult || filesResult.length > 0) {
          const file = filesResult[0]
          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) {
              return
            }
            const node = $createInlineImageNode({
              altText: '',
              position: position,
              src: file.result, // base64
              fileData: null,
              belongsTo: null,
              isWebUploadable: true,
            })
            selection.insertNodes([node])
          })
        }
        toggleModal(drawerSlug)
      }
    },
    [position, toggleModal, drawerSlug],
  )

  return (
    <React.Fragment>
      <SelectImageModal
        ref={null}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
        handlePaste={handlePaste}
        toggleUploadsDrawer={toggleUploadsDrawer}
        selectImageDrawerSlug={drawerSlug}
        allowMultipleFiles={false}
      >
        <Select
          style={{ marginBottom: '1em', width: '290px' }}
          label="Position"
          name="position"
          id="position-select"
          onChange={handlePositionChange}
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="full">Full Width</option>
        </Select>
      </SelectImageModal>
      <UploadDrawer
        enabledCollectionSlugs={collections.map(({ slug }) => slug)}
        position={position}
        modalSlug={drawerSlug}
        toggleModal={toggleModal}
      />
    </React.Fragment>
  )
}

const $onDragStart = (event: DragEvent): boolean => {
  const TRANSPARENT_IMAGE =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  const img = document.createElement('img')
  img.src = TRANSPARENT_IMAGE

  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  const dataTransfer = event.dataTransfer
  if (!dataTransfer) {
    return false
  }
  dataTransfer.setData('text/plain', '_')
  dataTransfer.setDragImage(img, 0, 0)
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        altText: node.__altText,
        // caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        // showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: 'image',
    }),
  )

  return true
}

const $onDragover = (event: DragEvent): boolean => {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  if (!canDropImage(event)) {
    event.preventDefault()
  }
  return true
}

const $onDrop = (event: DragEvent, editor: LexicalEditor): boolean => {
  const node = $getImageNodeInSelection()
  if (!node) {
    return false
  }
  const data = getDragImageData(event)
  if (!data) {
    return false
  }
  event.preventDefault()
  if (canDropImage(event)) {
    const range = getDragSelection(event)
    node.remove()
    const rangeSelection = $createRangeSelection()
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range)
    }
    $setSelection(rangeSelection)
    editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, data)
  }
  return true
}

const $getImageNodeInSelection = (): InlineImageNode | null => {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return null
  }
  const nodes = selection.getNodes()
  const node = nodes[0]
  return $isInlineImageNode(node) ? node : null
}

const getDragImageData = (event: DragEvent): null | InsertInlineImagePayload => {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag')
  if (!dragData) {
    return null
  }
  const { type, data } = JSON.parse(dragData)
  if (type !== 'image') {
    return null
  }

  return data
}

declare global {
  interface DragEvent {
    rangeOffset?: number
    rangeParent?: Node
  }
}

const canDropImage = (event: DragEvent): boolean => {
  const target = event.target
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest('code, span.editor-image') &&
    target.parentElement &&
    target.parentElement.closest('div.ContentEditable__root')
  )
}

const getDragSelection = (event: DragEvent): Range | null | undefined => {
  let range
  const target = event.target as null | Element | Document
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
        ? (target as Document).defaultView
        : (target as Element).ownerDocument.defaultView
  const domSelection = getDOMSelection(targetWindow)
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY)
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0)
    range = domSelection.getRangeAt(0)
  } else {
    throw Error('Cannot get the selection when dragging')
  }

  return range
}
