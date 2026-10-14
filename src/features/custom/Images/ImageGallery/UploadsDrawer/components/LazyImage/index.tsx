import React, { Suspense, useContext } from 'react'
import { Popup } from 'payload/components'
import { GetAdminThumbnail } from '../../../../../../lib/types'
import DragHandle from '../More'
import { useTranslation } from 'react-i18next'
import { getThumbnailUrl } from '../utils'
import { ImageDataTypeWithSlug } from '../../../../Shared/types'
import { UploadsDrawerContext } from '../Context'

const imageCache = new Set()

const baseImageClass = 'lazy-image'

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

export const ImageSkeleton = () => <div className="image-skeleton" />

export type LazyImageProps = {
  collectionSlug: string
  docID: string | number
  showMediaInfo: boolean
  attributes?: React.ImgHTMLAttributes<HTMLImageElement>
} & Omit<ImageDataTypeWithSlug, 'id'>

export const LazyImage = ({ collectionSlug, docID, showMediaInfo, ...rest }: LazyImageProps) => {
  useSuspenseImage(rest.attributes.src)

  const { t } = useTranslation('multiselect_drawer')

  const { filename, url, mimeType, filesize, width, height, focalX, focalY } = rest

  return (
    <div className={`${baseImageClass}__wrapper`}>
      <div className={`${baseImageClass}__collection`}>{collectionSlug} </div>
      {showMediaInfo && (
        <Popup
          className={`${baseImageClass}__media-info-popup`}
          button={<DragHandle className={`${baseImageClass}__popup_trigger`} />}
          showOnHover
          verticalAlign="bottom"
          horizontalAlign="left"
          showScrollbar
        >
          <div>
            <b>{t('collection')}:</b> {collectionSlug}
          </div>
          <div>
            <b>ID:</b> {docID}
          </div>
          {filename && (
            <div>
              <b>{t('media_info.filename')}:</b> {filename}
            </div>
          )}
          {url && (
            <div>
              <b>Url:</b> {url}
            </div>
          )}
          {mimeType && (
            <div>
              <b>{t('media_info.mime')}:</b> {mimeType}
            </div>
          )}
          {filesize && (
            <div>
              <b>{t('media_info.size')}:</b> {Math.floor(filesize / 1024)} kB
            </div>
          )}
          {width && (
            <div>
              <b>{t('media_info.width')}:</b> {width} px
            </div>
          )}
          {height && (
            <div>
              <b>{t('media_info.height')}:</b> {height} px
            </div>
          )}
          {focalX && (
            <div>
              <b>{t('media_info.focalx')}:</b> {focalX} %
            </div>
          )}
          {focalY && (
            <div>
              <b>{t('media_info.focaly')}:</b> {focalY} %
            </div>
          )}
        </Popup>
      )}

      <img
        className={`${baseImageClass}__image`}
        data-slug={collectionSlug}
        data-id={docID}
        {...rest.attributes}
      />
    </div>
  )
}

export const SelectableImage = ({
  baseClass,
  upload,
  adminThumbnail,
  showMediaInfo,
  handleDragStart,
  isSelected,
}: {
  baseClass: string
  upload: ImageDataTypeWithSlug
  adminThumbnail: GetAdminThumbnail | string
  showMediaInfo: boolean
  handleDragStart?: (e: React.DragEvent) => void
  isSelected: boolean
}) => {
  let url = getThumbnailUrl(upload, adminThumbnail)

  const { onSelect } = useContext(UploadsDrawerContext)

  const handleClick = () => {
    onSelect(upload)
  }

  return (
    <div key={upload.id} className={`${baseClass}`} onClick={handleClick}>
      <Suspense fallback={<ImageSkeleton />}>
        <LazyImage
          docID={upload?.id}
          collectionSlug={upload?.slug}
          showMediaInfo={showMediaInfo}
          attributes={{
            src: url,
            ...(handleDragStart
              ? {
                  onDragStart: handleDragStart,
                }
              : {}),
          }}
          {...upload}
        />
      </Suspense>
      <input
        className={`${baseImageClass}__select`}
        type="checkbox"
        checked={isSelected}
        readOnly
      />
    </div>
  )
}
