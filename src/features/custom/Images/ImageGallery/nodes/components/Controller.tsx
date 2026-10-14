import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { GalleryNode } from '../GalleryNode'
import {
  $checkUploadNodeExists,
  $insertImageFromFile,
  $insertImageFromUpload,
  $isGalleryNode,
} from '../GalleryNode'
import { toast } from 'react-toastify'
import { $isGalleryImageNode } from '../ImageNode'
import { OPEN_UPLOAD_DRAWER_COMMAND } from '../../plugin'
import type { GalleryImageNode } from '../ImageNode'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDropPasteInsert } from '../../../../Shared/SelectImageModal/hooks'
import { FileResultDataURL } from '../../../../../lib/types'
import SelectImageModal from '../../../../Shared/SelectImageModal'
import { useGallery } from '../../store'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { GalleryFeatureProps } from '../..'
import { ImageDataTypeWithSlug } from '../../../Shared/types'
import { $getNodeByKey } from 'lexical'
import GalleryContextProvider, { GalleryContext } from '../context'
import isSelected from '../../UploadsDrawer/isSelected'
import UploadsDrawerComponent from '../../UploadsDrawer'
import { Drawer } from './Modal'
import { useModal } from '@faceless-ui/modal'

const ACCEPTABLE_IMAGE_TYPES = ['image/', 'image/heic', 'image/heif', 'image/gif', 'image/webp']

export const ControllerComponent = ({ galleryNode }) => {
  return (
    <GalleryContextProvider>
      <Controller galleryNode={galleryNode} />
    </GalleryContextProvider>
  )
}

export const UPLOADS_DRAWER_SLUG = 'IMAGE_GALLERY_UPLOADS_DRAWER'

const Controller = ({ galleryNode }: { galleryNode: GalleryNode }) => {
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation('image_gallery')
  //pasting files from clipboard or dropping files in drop zone
  const {
    files: insertedFiles,
    existingFiles,
    clearExistingFile,
    onDrop,
    onFileChange,
    onPaste,
  } = useDropPasteInsert({
    acceptableMimeTypes: ACCEPTABLE_IMAGE_TYPES,
  })

  const prevFilesRef = useRef<FileResultDataURL[]>([])

  const { editorConfig } = useEditorConfigContext()

  const { collections } = editorConfig.resolvedFeatureMap.get('gallery')
    ?.props as GalleryFeatureProps

  //unique slugs
  const uploadsDrawerSlug = galleryNode.__uploadsDrawerSlug
  const selectImageDrawerSlug = galleryNode.__selectImageDrawerSlug

  // const [UploadsDrawer] = useUploadsDrawer(uploadsDrawerSlug)

  const { setGalleryNodeKey, setSelectImageDrawerSlug, setUploadsDrawerSlug } =
    useContext(GalleryContext)

  useEffect(() => {
    setGalleryNodeKey(galleryNode.__key)
    setSelectImageDrawerSlug(selectImageDrawerSlug)
    setUploadsDrawerSlug(uploadsDrawerSlug)
  }, [galleryNode.__key, selectImageDrawerSlug, uploadsDrawerSlug])

  const { closeModal, toggleModal } = useModal()

  const {
    selection,
    shouldInsertMedia,
    setSelection,
    setShouldInsertMedia,
    deleteSelectionBySlugAndId,
    files,
    setFiles,
  } = useGallery(galleryNode.__key)

  const collectionSlugs = useMemo(() => Object.keys(collections), [collections])

  const handleOnSelect = useMemo(
    () => (selectedUpload: ImageDataTypeWithSlug) => {
      if (isSelected(selection, selectedUpload?.id)) {
        deleteSelectionBySlugAndId(
          {
            id: selectedUpload.id,
            collectionSlug: selectedUpload.slug,
          },
          galleryNode.__key,
        )
      } else {
        setSelection((prev) => [...prev, selectedUpload])
      }
    },
    [isSelected, selection, deleteSelectionBySlugAndId, galleryNode.__key, setSelection],
  )

  const handleOnConfirm = useCallback(() => {
    console.log('call')
    setShouldInsertMedia(true)
    setIsOpen(false)
    closeModal(selectImageDrawerSlug)
  }, [
    setShouldInsertMedia,
    closeModal,
    uploadsDrawerSlug,
    selectImageDrawerSlug,
    galleryNode.__key,
  ])

  const dropZoneRef = useRef(null)

  const getUploadNodesCount = useCallback(() => {
    let count = 0
    editor.getEditorState().read(() => {
      const children = galleryNode.getChildren()
      for (const child of children) {
        if ($isGalleryImageNode(child) && child.getFileData()?.id) {
          count++
        }
      }
    })
    return count
  }, [editor])

  //add existing payload images to gallery selection
  useEffect(() => {
    editor.getEditorState().read(() => {
      const gallery = $getNodeByKey(galleryNode.__key)
      if (gallery && $isGalleryNode(gallery)) {
        const imageNodes = gallery
          .getChildren()
          ?.filter(
            (node) => node.__type === 'gallery-image' && (node as GalleryImageNode).__fileData?.id,
          )

        if (imageNodes?.length > 0) {
          setSelection([
            ...imageNodes.map((node: GalleryImageNode) => ({
              slug: node.__belongsTo,
              ...node.__fileData,
            })),
          ])
        }
      }
    })
  }, [editor])

  const removeUncheckedUploads = useCallback(() => {
    editor.update(() => {
      if (selection.length > 0 && getUploadNodesCount() !== 0) {
        const children = galleryNode.getChildren()
        if (children?.length > 0) {
          children.forEach((child: GalleryImageNode) => {
            //skip files from FS or base64 encoded
            if (child && $isGalleryImageNode(child) && child.getFileData()?.id === null) {
              return
            }
            if (
              !selection.some(
                (value) =>
                  child && $isGalleryImageNode(child) && value.id === child.getFileData()?.id,
              )
            ) {
              if ($isGalleryImageNode(child)) {
                child.remove()
              }
            }
          })
        }
      }
    })
  }, [editor, getUploadNodesCount, selection])

  // selection is 0 => remove all image nodes
  // selected uploads > existing image nodes => insert new ones into the gallery
  // selected uploads < existing image nodes => remove unchecked nodes and insert selection into the gallery
  useEffect(() => {
    const insertMedia = async () => {
      if (shouldInsertMedia) {
        if (selection.length === 0) {
          editor.update(() => {
            const children = galleryNode.getChildren() as GalleryImageNode[]
            if (children.length > 0) {
              //files from file system don't have an id yet
              const imageNodes = children.filter(
                (child) => child && $isGalleryImageNode(child) && child.getFileData()?.id !== null,
              )

              imageNodes.forEach((upload) => {
                if ($isGalleryImageNode(upload)) {
                  upload.remove()
                }
              })
            }
          })
        } else if (selection.length > getUploadNodesCount()) {
          editor.update(() => {
            for (let i = 0; i < selection.length; i++) {
              if (!$checkUploadNodeExists(selection[i].id, galleryNode)) {
                $insertImageFromUpload(selection[i], galleryNode)
              }
            }
          })
        } else if (selection.length < getUploadNodesCount()) {
          editor.update(() => {
            removeUncheckedUploads()
            for (let i = 0; i < selection.length; i++) {
              $insertImageFromUpload(selection[i], galleryNode)
            }
          })
        }
        setShouldInsertMedia(false)
      }
    }
    void insertMedia()
  }, [
    editor,
    getUploadNodesCount,
    $insertImageFromUpload,
    removeUncheckedUploads,
    selection,
    setShouldInsertMedia,
    shouldInsertMedia,
  ])

  useEffect(() => {
    if (insertedFiles.length > 0) {
      const filesToAdd: FileResultDataURL[] = []
      insertedFiles.forEach((currentFile) => {
        if (existingFiles.includes(currentFile.file.name)) {
          toast.error(
            `${t('file_exists', { fileName: currentFile.file.name, interpolation: { escapeValue: false } })}`,
          )
          clearExistingFile(currentFile.file.name)
        } else {
          filesToAdd.push(currentFile)
        }
      })
      setFiles(filesToAdd, galleryNode.__key)
    }
  }, [insertedFiles, existingFiles, $insertImageFromFile])

  useEffect(() => {
    const prev = prevFilesRef.current

    const newFiles = files.filter((f) => !prev.some((p) => p.result === f.result))

    if (newFiles.length > 0) {
      editor.update(() => {
        newFiles.forEach((file) => {
          $insertImageFromFile(file, galleryNode)
        })
      })
    }

    prevFilesRef.current = files
  }, [files])

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      await onDrop(e)
      toggleModal(selectImageDrawerSlug)
    },
    [onDrop, toggleModal],
  )

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await onFileChange(e)
      toggleModal(selectImageDrawerSlug)
    },
    [onDrop, toggleModal],
  )

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      await onPaste(e)
      toggleModal(selectImageDrawerSlug)
    },
    [onDrop, toggleModal],
  )

  const toggleUploadsDrawer = useCallback(() => {
    // editor.dispatchCommand(OPEN_UPLOAD_DRAWER_COMMAND, UPLOADS_DRAWER_SLUG)
    setIsOpen(true)
  }, [editor, OPEN_UPLOAD_DRAWER_COMMAND, uploadsDrawerSlug])

  return (
    <GalleryContextProvider>
      <SelectImageModal
        ref={dropZoneRef}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
        handlePaste={handlePaste}
        toggleUploadsDrawer={toggleUploadsDrawer}
        selectImageDrawerSlug={selectImageDrawerSlug}
        galleryNodeKey={galleryNode.__key}
        allowMultipleFiles
      />
      {isOpen && (
        <Drawer isOpen={isOpen} close={() => setIsOpen(false)} slug={UPLOADS_DRAWER_SLUG}>
          belongs to: {galleryNode.__key}
          <UploadsDrawerComponent
            props={{
              activeCollection: collectionSlugs[0],
              enabledCollections: collectionSlugs,
              galleryNodeKey: galleryNode.__key,
              onSelect: (item) => handleOnSelect(item),
              onConfirm: () => handleOnConfirm(),
            }}
          />
        </Drawer>
      )}
    </GalleryContextProvider>
  )
}

export default ControllerComponent
