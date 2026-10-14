import React from 'react'
import { baseClass } from '../ColorPicker'
import useColorPickerContext from '../Context'
import { roundNumber, transformColor } from '../converters'

import { zeroTo360Regex, zeroTo100Regex, zeroTo1Regex } from './regex'
import NumberInput from './number'
import CopyButton from './copy'

const hsvaValidate = {
  h: zeroTo360Regex,
  s: zeroTo100Regex,
  v: zeroTo100Regex,
  a: zeroTo1Regex,
}

const HsvaInput = () => {
  const { hsva, setHsva, setSelfColor, setInputColor } = useColorPickerContext()

  const handleHsvaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    const inputName = e.target.name
    const channel = inputName.replace('hsva_', '')
    const regex = hsvaValidate[channel]

    const newHsva = {
      ...hsva,
      [channel]: value,
    }

    if (Number.isNaN(value)) {
      if (channel === 'a') {
        setHsva({
          ...hsva,
          [channel]: 1,
        })
      }
      setHsva({
        ...hsva,
        [channel]: 0,
      })
    }

    if (regex.test(value.toString())) {
      const newColor = transformColor('hsva', newHsva)
      setSelfColor(newColor)
      setInputColor(newColor.hex)
      setHsva(newHsva)
    }
  }

  return (
    <div className={`${baseClass}__input-wrapper`}>
      <label>HSVA</label>
      <NumberInput
        label="H"
        name="hsva_h"
        max={360}
        min={0}
        step={1}
        value={roundNumber(hsva.h, 0)}
        onChange={handleHsvaChange}
      />
      <NumberInput
        label="S"
        name="hsva_s"
        max={100}
        min={0}
        step={1}
        value={roundNumber(hsva.s, 0)}
        onChange={handleHsvaChange}
      />
      <NumberInput
        label="V"
        name="hsva_v"
        max={100}
        min={0}
        step={1}
        value={roundNumber(hsva.v, 0)}
        onChange={handleHsvaChange}
      />
      <NumberInput
        label="A"
        name="hsva_a"
        max={1}
        min={0}
        step={0.01}
        value={roundNumber(hsva.a, 2)}
        onChange={handleHsvaChange}
      />
      <CopyButton inputType="hsva" />
    </div>
  )
}

export default HsvaInput
