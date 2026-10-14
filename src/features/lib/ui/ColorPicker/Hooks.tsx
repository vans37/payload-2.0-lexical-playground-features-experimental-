import { useEffect, useState } from 'react'

const useDimensions = <T extends HTMLElement>(ref: React.RefObject<T>) => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const updateDimensions = () => {
      if (ref.current) {
        setDimensions({
          width: ref.current.getBoundingClientRect().width,
          height: ref.current.getBoundingClientRect().height,
        })
      }
    }

    if (ref.current) {
      updateDimensions()
    }

    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [ref.current, setDimensions])

  return dimensions
}

export default useDimensions
