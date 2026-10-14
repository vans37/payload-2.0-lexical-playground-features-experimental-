import React, { useContext, useEffect, useState } from 'react'
import { Button, Search } from 'payload/components'
import { useTranslation } from 'react-i18next'
import Pagination from '../../Paginator'
import { useConfig } from 'payload/components/utilities'
import { useDebounce } from 'payload/components/hooks'
import fetchResource, { isSuccessResponse } from '../../../../../../../lib/api/fetchResource'
import { PaginatedDocs } from 'payload/database'
import { ImageDataType } from '../../../../../Shared/types'
import { useUploadsDrawerDocsStore } from '../../../store/docs'
import { UploadsDrawerContext } from '../../Context'
import { baseClass } from '../../..'

export default function Controls() {
  const { currentPage, limit, docs, totalDocs, setLimit, setCurrentPage } =
    useUploadsDrawerDocsStore()

  const { activeCollection, enabledCollections, onConfirm } = useContext(UploadsDrawerContext)

  const { t } = useTranslation('multiselect_drawer')

  const pageCount = Math.floor(totalDocs / limit)

  const changeLimit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.currentTarget.value))
    setCurrentPage(1)
  }

  // const handleSelectAll = () => {
  //   setSelection([...docs])
  // }

  // const handleClearAll = () => {
  //   setSelection([])
  // }

  // const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setCurrentPage(1)
  //   setActiveCollection(e.target.value)
  // }

  return (
    <div className={`${baseClass}__controls`}>
      <div className={`${baseClass}__upper-controls`}>
        <div className={`${baseClass}__select-limit`}>
          <span>{t('limit')}:</span>
          <select
            name="select-limit"
            onChange={(e) => {
              changeLimit(e)
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={100}>150</option>
            <option value={100}>200</option>
          </select>
        </div>
        {/* {enabledCollections?.length > 0 && (
          <div className={`${baseClass}__select-collection`}>
            <span>{t('collection')}:</span>
            <select
              defaultValue={activeCollection}
              name="select-collection"
              onChange={handleCollectionChange}
            >
              {enabledCollections.map((collection, id) => (
                <option key={id} value={collection}>
                  {collection.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )} */}
        <Pagination
          disableHistoryChange
          page={currentPage}
          nextPage={currentPage + 1}
          prevPage={currentPage - 1}
          totalPages={pageCount}
          limit={limit}
          onChange={(page) => setCurrentPage(page)}
          hasNextPage={currentPage * limit < totalDocs}
          hasPrevPage={currentPage > 1}
          numberOfNeighbors={2}
        />
      </div>
      <SearchComponent activeCollection={activeCollection} />
      <div className={`${baseClass}__buttons`}>
        <Button onClick={() => onConfirm()}>{t('confirm')}</Button>
        {/* <Button disabled={selection.length === docs.length} onClick={handleSelectAll}>
          {t('select_all')}
        </Button>
        <Button disabled={selection.length === 0} onClick={handleClearAll}>
          {t('clear_selection')}
        </Button> */}
      </div>
    </div>
  )
}

const SearchComponent = ({ activeCollection }: { activeCollection: string }) => {
  const { t } = useTranslation('multiselect_drawer')
  const baseClass = 'search-filter'
  const { setDocs } = useUploadsDrawerDocsStore()
  const [search, setSearch] = useState('')
  const [previousSearch, setPreviousSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const {
    routes: { api },
    serverURL,
  } = useConfig()

  useEffect(() => {
    if (debouncedSearch !== previousSearch) {
      setPreviousSearch(debouncedSearch)
    }
  }, [debouncedSearch, previousSearch])

  useEffect(() => {
    const handleSearch = async () => {
      const response = await fetchResource<PaginatedDocs<ImageDataType>>(
        `${serverURL}${api}/${activeCollection}`,
        {
          params: {
            where: {
              filename: {
                like: search,
              },
            },
          },
        },
      )

      if (isSuccessResponse(response)) {
        const uploads = response.data.docs.map((doc) => ({
          slug: activeCollection,
          ...doc,
        }))

        setDocs([...uploads])
      }
    }
    handleSearch()
  }, [debouncedSearch, previousSearch])

  return (
    <React.Fragment>
      <div className={baseClass}>
        <input
          className={`${baseClass}__input`}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
          type="text"
          value={search || ''}
        />
        <Search />
      </div>
    </React.Fragment>
  )
}
