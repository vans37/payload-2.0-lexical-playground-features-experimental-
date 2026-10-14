import React, { useRef } from 'react'
import MoveWrapper from '../MoveWrapper'
import { baseClass } from '../ColorPicker'
import useColorPickerContext from '../Context'
import { Position } from '../types'
import { clamp, transformColor } from '../converters'
import useDimensions from '../Hooks'

export const AlphaInput = () => {
  const { alpha, selfColor, inputColor, setAlpha, setSelfColor, setInputColor } =
    useColorPickerContext()

  const alphaRef = useRef<HTMLDivElement>(null)

  const dimenstions = useDimensions(alphaRef)

  const hex2hexWithAlpha = React.useCallback(
    (currentHexValue: string, alpha: number) => {
      const alphaHexString = Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, '0')

      const baseColorHex = currentHexValue.replace(/^#/, '')

      //replace alpha channel with a new value
      if (baseColorHex.length === 8) {
        const newAlpha = Math.floor(alpha * 255)
          .toString(16)
          .padStart(2, '0')
        return `#${baseColorHex.substring(0, 6)}${newAlpha}`
      }

      const hexWithAlpha = `#${baseColorHex}${alphaHexString}`

      return hexWithAlpha
    },
    [alpha],
  )

  const onMoveAlpha = ({ x }: Position) => {
    const alpha = clamp(x / dimenstions.width, 1, 0)
    const hexWithAlpha = hex2hexWithAlpha(inputColor, alpha)
    const newColor = transformColor('hex', hexWithAlpha)

    setAlpha(alpha)
    setSelfColor(newColor)
    setInputColor(newColor.hex)
  }

  return (
    <MoveWrapper ref={alphaRef} className={`${baseClass}__alpha`} onChange={onMoveAlpha}>
      <div
        className={`${baseClass}__alpha-cursor`}
        style={{
          left: `${alpha * 100}%`,
          backgroundColor: `rgba(${selfColor.rgba.r}, ${selfColor.rgba.g}, ${selfColor.rgba.b}, ${alpha})`,
        }}
      />
    </MoveWrapper>
  )
}
