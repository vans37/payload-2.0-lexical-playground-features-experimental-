import React, { useContext, useEffect, useRef, useState } from 'react'
import { useConfig } from 'payload/components/utilities'
import { useTranslation } from 'react-i18next'
import { translations } from './i18n'
import './index.scss'
import UploadsDrawerContextProvider, { UploadsDrawerContext } from './components/Context'
import { NodeKey } from 'lexical'
import { useUploadsDrawerDocsStore } from './store/docs'
import fetchResource, { isSuccessResponse } from '../../../../lib/api/fetchResource'
import { PaginatedDocs } from 'payload/database'
import { ImageDataType, ImageDataTypeWithSlug } from '../../Shared/types'
import UploadsContainer from './components/Uploads'

export const baseClass = 'uploads-drawer'

export type UploadsDrawerProps = {
  galleryNodeKey: NodeKey
  activeCollection: string
  enabledCollections: string[]
  onSelect: (item: ImageDataTypeWithSlug) => void
  onConfirm: () => void
}

const UploadsDrawerComponent = ({ props }: { props: UploadsDrawerProps }) => {
  return (
    <UploadsDrawerContextProvider>
      <UploadsDrawer props={props} />
    </UploadsDrawerContextProvider>
  )
}

const UploadsDrawer = ({ props }: { props: UploadsDrawerProps }) => {
  const { i18n } = useTranslation()

  useEffect(() => {
    for (const lang of Object.keys(translations)) {
      const namespaces = Object.keys(translations[lang])
      for (const namespace of namespaces) {
        const resource = translations[lang][namespace]
        if (resource) {
          i18n.addResourceBundle(lang, namespace, resource, true, true)
        }
      }
    }
  }, [i18n])

  const { totalDocs, limit, currentPage, setDocs, setTotalDocs } = useUploadsDrawerDocsStore()
  const { activeCollection, enabledCollections, galleryNodeKey, onSelect, onConfirm } = props

  const {
    setActiveCollection,
    setEnabledCollections,
    setGalleryNodeKey,
    setOnSelect,
    setOnConfirm,
  } = useContext(UploadsDrawerContext)

  useEffect(() => {
    setActiveCollection(activeCollection)
    setEnabledCollections(enabledCollections)
    setGalleryNodeKey(galleryNodeKey)
    setOnSelect(onSelect)
    setOnConfirm(onConfirm)
  }, [galleryNodeKey, activeCollection, enabledCollections])

  const [isPending, setIsPending] = useState(false)
  const [fetchError, setFetchError] = useState<{
    error: boolean
    message?: string
  } | null>(null)

  const { t } = useTranslation('multiselect_drawer')

  const drawerRef = useRef<HTMLDivElement>(null)

  const {
    collections,
    routes: { api },
    serverURL,
  } = useConfig()

  const collectionConfig = collections.find((value) => value.slug === activeCollection)

  useEffect(() => {
    const fetchUploads = async () => {
      setIsPending(true)

      const response = await fetchResource<PaginatedDocs<ImageDataType>>(
        `${serverURL}${api}/${activeCollection}`,
        {
          params: {
            limit: limit,
            page: currentPage,
          },
        },
      )

      if (isSuccessResponse(response)) {
        const { docs } = response.data
        if (docs && docs.length > 0) {
          const uploads = docs.map((doc) => ({
            slug: activeCollection,
            ...doc,
          }))
          setDocs(uploads)
          setTotalDocs(response.data.totalDocs)
          setIsPending(false)
        } else {
          setDocs([])
          setIsPending(false)
        }
      } else {
        setFetchError(response)
        setIsPending(false)
      }
    }

    void fetchUploads()
  }, [currentPage, limit, serverURL, activeCollection])

  const adminThumbnail = collectionConfig?.upload?.adminThumbnail

  return (
    <div className={`${baseClass}`} ref={drawerRef}>
      {!fetchError && (
        <React.Fragment>
          {/* <SelectionSidebar adminThumbnail={adminThumbnail} drawerRef={drawerRef} isResizable /> */}
          <UploadsContainer isRequestPending={isPending} adminThumbnail={adminThumbnail} />
        </React.Fragment>
      )}
      {fetchError && (
        <div>
          {t('fetch_error')} {fetchError.message}{' '}
        </div>
      )}
    </div>
  )
}

export default UploadsDrawerComponent
