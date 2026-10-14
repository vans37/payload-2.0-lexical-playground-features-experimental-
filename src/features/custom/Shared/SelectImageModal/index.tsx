import React, { useCallback, useRef } from 'react'
import { Button, Drawer } from 'payload/components/elements'
import { useTranslation } from 'react-i18next'

import './index.scss'
import { NodeKey } from 'lexical'
//import { useUploadsDrawerStore } from '../../Images/ImageGallery/UploadsDrawer/store/drawer'

export type SelectImagesProps = {
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>
  handlePaste: (e: React.ClipboardEvent<HTMLDivElement>) => Promise<void>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  toggleUploadsDrawer: () => void
  selectImageDrawerSlug: string
  galleryNodeKey: NodeKey
  allowMultipleFiles: boolean
  children?: React.ReactNode
}

const SelectImageModal = React.forwardRef(
  (props: SelectImagesProps, ref: React.MutableRefObject<HTMLDivElement>) => {
    const {
      handleDrop,
      handlePaste,
      handleFileChange,
      toggleUploadsDrawer,
      selectImageDrawerSlug,
      children,
      allowMultipleFiles,
      galleryNodeKey,
    } = props

    // const { setActiveGalleryNodeKey } = useUploadsDrawerStore()

    const handleSelectUploads = useCallback(() => {
      // setActiveGalleryNodeKey(galleryNodeKey)
      toggleUploadsDrawer()
    }, [toggleUploadsDrawer, galleryNodeKey])

    const { t } = useTranslation('image_gallery')

    const fileInputRef = useRef<HTMLInputElement>(null)

    return (
      <Drawer title={t('select_image')} slug={selectImageDrawerSlug}>
        <div className="select-images-drawer">
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onPaste={handlePaste}
            ref={ref}
          >
            <div className="select">
              <div>{t('select_image_dnd')}</div>
              <Button
                onClick={() => {
                  fileInputRef.current?.click()
                }}
              >
                {t('select_files')}
              </Button>
              <input
                hidden
                ref={fileInputRef}
                type="file"
                accept="image/*"
                {...(allowMultipleFiles ? { multiple: true } : {})}
                onChange={handleFileChange}
              />
              <div>
                <Button onClick={handleSelectUploads}>{t('select_uploads_btn')}</Button>
              </div>
            </div>
          </div>
        </div>
        {children}
      </Drawer>
    )
  },
)

export default SelectImageModal
