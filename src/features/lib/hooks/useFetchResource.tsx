import { useLocale } from 'payload/components/utilities'
import { requests } from 'payload/dist/admin/api'
import queryString from 'qs'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Result = [
  {
    data: any
    isError: boolean
    isLoading: boolean
  },
  {
    fetchData: (URL: string, abortController?: AbortController) => Promise<void>
    setParams: React.Dispatch<unknown>
  },
]

type Options = {
  initialData?: any
  initialParams?: unknown
}

type UseFetchResource = (options?: Options) => Result

const useFetchResource: UseFetchResource = (options = {}) => {
  const { initialData = {}, initialParams = {} } = options

  const { i18n } = useTranslation()
  const [data, setData] = useState(initialData)
  const [params, setParams] = useState(initialParams)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const { code: locale } = useLocale()

  const search = queryString.stringify(
    {
      locale,
      ...(typeof params === 'object' ? params : {}),
    },
    {
      addQueryPrefix: true,
    },
  )

  const fetchData = useCallback(
    async (URL, abortController?: AbortController) => {
      if (URL) {
        setIsError(false)
        setIsLoading(true)

        try {
          const response = await requests.get(`${URL}${search}`, {
            headers: {
              'Accept-Language': i18n.language,
            },
            signal: abortController ? abortController.signal : undefined,
          })

          if (response.status > 201) {
            setIsError(true)
          }

          const json = await response.json()
          setData(json)
          setIsLoading(false)
        } catch (error) {
          if (!abortController || !abortController.signal.aborted) {
            setIsError(true)
            setIsLoading(false)
          }
        }
      } else {
        setIsError(false)
        setIsLoading(false)
      }
    },
    [URL, search, i18n.language],
  )

  return [
    { data, isError, isLoading },
    { fetchData, setParams },
  ]
}

export default useFetchResource
