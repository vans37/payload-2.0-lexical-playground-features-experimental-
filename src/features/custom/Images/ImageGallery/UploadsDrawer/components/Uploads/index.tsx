import React, { useContext, useEffect, useMemo } from 'react'
import { GetAdminThumbnail } from '../../../../../../lib/types'
import { SelectableImage } from '../LazyImage'
import { useTranslation } from 'react-i18next'
import Controls from './Controls'
import { ImageDataTypeWithSlug } from '../../../../Shared/types'
import { useUploadsDrawerDocsStore } from '../../store/docs'

import { useGallery } from '../../../store'
import { UploadsDrawerContext } from '../Context'
import { baseClass } from '../..'

const isSelected = (selection: ImageDataTypeWithSlug[], id: number | string): boolean => {
  if (!selection || selection?.length === 0) return false
  return !!selection?.filter((selection) => selection?.id === id)?.length
}

const CollectionDocuments = ({
  uploads,
  adminThumbnail,
}: {
  uploads: ImageDataTypeWithSlug[]
  adminThumbnail: GetAdminThumbnail | string
}) => {
  const { galleryNodeKey } = useContext(UploadsDrawerContext)
  const { selection, setSelection, deleteSelectionBySlugAndId } = useGallery(galleryNodeKey)

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.target as HTMLImageElement

    const slug = target.getAttribute('data-slug')
    const id = target.getAttribute('data-id')

    e.dataTransfer.setDragImage(target, 0, 0)

    e.dataTransfer?.setData(
      'application/x-media',
      JSON.stringify({
        slug,
        id,
      }),
    )
  }

  return uploads.map((upload, idx) => {
    if (upload?.mimeType?.includes('image')) {
      return (
        <SelectableImage
          key={idx}
          baseClass={`${baseClass}__uploads-image-wrapper`}
          upload={upload}
          adminThumbnail={adminThumbnail}
          showMediaInfo
          handleDragStart={handleDragStart}
          isSelected={isSelected(selection, upload.id)}
        />
      )
    }
  })
}

const CollectionUploadsContainer = ({ adminThumbnail }: { adminThumbnail: any }) => {
  const { t } = useTranslation('image_gallery')

  const { docs } = useUploadsDrawerDocsStore()

  return (
    <div className={`${baseClass}__uploads`}>
      {docs.length > 0 && <CollectionDocuments uploads={docs} adminThumbnail={adminThumbnail} />}
      {docs.length === 0 && <div className={`${baseClass}__uploads-message`}>{t('empty')}</div>}
    </div>
  )
}

const UploadsContainer = ({
  isRequestPending,
  adminThumbnail,
}: {
  isRequestPending: boolean
  adminThumbnail: string | GetAdminThumbnail
}) => {
  const { t } = useTranslation('multiselect_drawer')

  return (
    <section className={`${baseClass}__uploads-section`}>
      <Controls />
      {isRequestPending && <div className={`${baseClass}__message`}>{t('loading')}</div>}
      {!isRequestPending && <CollectionUploadsContainer adminThumbnail={adminThumbnail} />}
    </section>
  )
}

export default UploadsContainer
