import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { Position } from './types'
import { calculateZoomLevel } from '../../utils/calculateZoomLevel'
import { clamp } from './converters'
import { setSkipAddingToHistoryStack } from './ColorPicker'

export interface MoveWrapperProps {
  className?: string
  style?: React.CSSProperties
  onChange: (position: Position) => void
  children: JSX.Element
}

const MoveWrapper = forwardRef(
  (
    { className, style, onChange, children }: MoveWrapperProps,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const divRef = useRef<HTMLDivElement>(null)
    const draggedRef = useRef(false)

    useImperativeHandle(ref, () => divRef.current)

    const move = (e: React.MouseEvent | MouseEvent): void => {
      if (divRef.current) {
        const { current: div } = divRef
        const { width, height, left, top } = div.getBoundingClientRect()
        const zoom = calculateZoomLevel(div)

        const x = clamp(e.clientX / zoom - left, width, 0)
        const y = clamp(e.clientY / zoom - top, height, 0)

        onChange({ x, y })
      }
    }

    const onMouseDown = (e: React.MouseEvent): void => {
      if (e.button !== 0) {
        return
      }

      move(e)

      const onMouseMove = (_e: MouseEvent): void => {
        draggedRef.current = true
        setSkipAddingToHistoryStack(true)
        move(_e)
      }

      const onMouseUp = (_e: MouseEvent): void => {
        if (draggedRef.current) {
          setSkipAddingToHistoryStack(false)
        }

        document.removeEventListener('mousemove', onMouseMove, false)
        document.removeEventListener('mouseup', onMouseUp, false)

        move(_e)
        draggedRef.current = false
      }

      document.addEventListener('mousemove', onMouseMove, false)
      document.addEventListener('mouseup', onMouseUp, false)
    }

    return (
      <div ref={divRef} className={className} style={style} onMouseDown={onMouseDown}>
        {children}
      </div>
    )
  },
)

export default MoveWrapper
