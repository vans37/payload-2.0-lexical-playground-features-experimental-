import { useEffect, useRef } from 'react'

const useClickOutside = (callback: () => void) => {
  const ref = useRef<HTMLElement | null>(null)
  const mountRef = useRef(false)

  useEffect(() => {
    setTimeout(() => {
      mountRef.current = true
    }, 0)

    return () => {
      mountRef.current = false
    }
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!mountRef.current) {
        return
      }

      if (ref?.current && !ref?.current?.contains(e?.target as Node)) {
        callback()
      }
    }
    document.addEventListener('click', handleClick)

    return () => document.removeEventListener('click', handleClick)
  }, [callback, ref])

  return ref
}

export default useClickOutside
