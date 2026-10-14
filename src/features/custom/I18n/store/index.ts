import { useCallback, useEffect, useState } from 'react'
import { create } from 'zustand'
import deepMerge from '../../../../features/lib/utils/deepMerge'
import { Resource } from '../types'
import { useTranslation } from 'react-i18next'

const initialState = {}
type State = {}

export const useI18nStore = create<{
  state: State
  dispatch: (action: Action) => void
}>((set) => ({
  state: initialState,
  dispatch: (action: Action) => set((state) => ({ state: reducer(state.state, action) })),
}))

type Action = { type: 'SET_RESOURCE'; resource: Resource }

const reducer = (state: State, action: Action) => {
  const { resource } = action

  switch (action.type) {
    case 'SET_RESOURCE': {
      return deepMerge(state, resource)
    }
    default:
      return state
  }
}

export const useInternalization = (nameSpace?: string) => {
  const dispatch = useI18nStore((state) => state.dispatch)
  const state = useI18nStore((state) => state.state)
  const { i18n, t } = useTranslation(nameSpace)
  const [translationsLoaded, setTranslationsLoaded] = useState(false)

  useEffect(() => {
    if (Object.keys(state).length > 0) {
      for (const lang of Object.keys(state)) {
        const namespaces = Object.keys(state[lang])
        for (const namespace of namespaces) {
          const resource = state[lang][namespace]
          if (resource) {
            i18n.addResourceBundle(lang, namespace, resource, true, true)
          }
        }
      }
      setTranslationsLoaded(true)
    }
  }, [i18n, state])

  const setResource = useCallback(
    (resource: Resource) => {
      dispatch({ type: 'SET_RESOURCE', resource })
    },
    [dispatch],
  )

  return {
    store: state,
    setResource,
    i18n,
    t,
    translationsLoaded,
  }
}
