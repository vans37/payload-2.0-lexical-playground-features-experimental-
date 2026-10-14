import queryString from 'qs'

interface ErrorResponse {
  error: true
  message?: string
  status?: number
}

interface SuccessResponse<T> {
  error: false
  data: T
}

export type FetchResponse<T> = ErrorResponse | SuccessResponse<T>

export const isSuccessResponse = <T>(
  response: FetchResponse<T>,
): response is SuccessResponse<T> => {
  return !response.error
}

export default async function fetchResource<T>(
  url: URL | globalThis.Request | string,
  options?: {
    init?: RequestInit
    locale?: string
    params?: Record<string, unknown>
  },
): Promise<FetchResponse<T>> {
  try {
    const searchString = queryString.stringify(
      {
        locale: options?.locale,
        ...(options?.params || {}),
      },
      {
        addQueryPrefix: true,
      },
    )

    const fullUrl = typeof url === 'string' || url instanceof URL ? `${url}${searchString}` : url

    const fetchOptions: RequestInit = {
      ...(options?.init || {}),
      headers: {
        'Content-Type': 'application/json',
        ...(options?.init?.headers || {}),
      },
      credentials: 'include',
    }

    const res = await fetch(fullUrl, fetchOptions)

    const contentType = res.headers.get('Content-Type')

    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json()
      return {
        error: false,
        data,
      }
    }

    return {
      error: true,
      message: res.statusText,
      status: res.status,
    }
  } catch (err) {
    return {
      error: true,
      message: err instanceof Error ? err.message : 'Network error',
    }
  }
}
