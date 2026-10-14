import React, { useMemo, useRef } from 'react'
import MoveWrapper from '../MoveWrapper'
import useColorPickerContext from '../Context'
import { Position } from '../types'
import { baseClass } from '../ColorPicker'
import { transformColor } from '../converters'
import useDimensions from '../Hooks'

const SaturationInput = () => {
  const { selfColor, setSelfColor, setInputColor } = useColorPickerContext()

  const saturationRef = useRef<HTMLDivElement>(null)
  const dimensions = useDimensions(saturationRef)

  const saturationPosition = useMemo(
    () => ({
      x: (selfColor.hsva.s / 100) * dimensions.width,
      y: ((100 - selfColor.hsva.v) / 100) * dimensions.height,
    }),
    [selfColor.hsva.s, selfColor.hsva.v, dimensions],
  )

  const onMoveSaturation = ({ x, y }: Position) => {
    const newHsv = {
      ...selfColor.hsva,
      s: (x / dimensions.width) * 100,
      v: 100 - (y / dimensions.height) * 100,
    }

    const newColor = transformColor('hsva', newHsv)
    setSelfColor(newColor)
    setInputColor(newColor.hex)
  }

  return (
    <MoveWrapper
      className={`${baseClass}__saturation`}
      ref={saturationRef}
      style={{ backgroundColor: `hsl(${selfColor.hsva.h}, 100%, 50%)` }}
      onChange={onMoveSaturation}
    >
      <div
        className={`${baseClass}__saturation-cursor`}
        style={{
          left: saturationPosition.x,
          top: saturationPosition.y,
        }}
      />
    </MoveWrapper>
  )
}

export default SaturationInput
