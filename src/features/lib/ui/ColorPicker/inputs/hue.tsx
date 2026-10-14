import React, { useMemo, useRef } from 'react'
import MoveWrapper from '../MoveWrapper'
import { baseClass } from '../ColorPicker'
import { Position } from '../types'
import useColorPickerContext from '../Context'
import useDimensions from '../Hooks'
import { transformColor } from '../converters'

const HueInput = () => {
  const { selfColor, setSelfColor, setInputColor } = useColorPickerContext()

  const hueRef = useRef<HTMLDivElement>()
  const dimensions = useDimensions(hueRef)

  const huePosition = useMemo(
    () => ({
      x: (selfColor.hsva.h / 360) * dimensions.width,
    }),
    [selfColor.hsva, dimensions],
  )

  //hsla will be recalculated and set in parent component based on hsv value
  const onMoveHue = ({ x }: Position) => {
    const newHsv = { ...selfColor.hsva, h: (x / dimensions.width) * 360 }
    const newColor = transformColor('hsva', newHsv)

    setSelfColor(newColor)
    setInputColor(newColor.hex)
  }

  return (
    <MoveWrapper ref={hueRef} className={`${baseClass}__hue`} onChange={onMoveHue}>
      <div
        className={`${baseClass}__hue_cursor`}
        style={{
          backgroundColor: `hsl(${selfColor.hsva.h}, 100%, 50%)`,
          left: huePosition.x,
        }}
      />
    </MoveWrapper>
  )
}

export default HueInput
