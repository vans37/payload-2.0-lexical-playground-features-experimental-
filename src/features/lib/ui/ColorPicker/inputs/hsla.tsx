import React from 'react'
import { baseClass } from '../ColorPicker'
import { roundNumber, transformColor } from '../converters'
import useColorPickerContext from '../Context'
import { zeroTo100Regex, zeroTo1Regex, zeroTo360Regex } from './regex'
import NumberInput from './number'
import CopyButton from './copy'

const hslaValidate = {
  h: zeroTo360Regex,
  s: zeroTo100Regex,
  l: zeroTo100Regex,
  a: zeroTo1Regex,
}

export const HslaInput = () => {
  const { hsla, setHsla, setSelfColor, setInputColor } = useColorPickerContext()

  const handleHslaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    const inputName = e.target.name
    const channel = inputName.replace('hsla_', '')
    const regex = hslaValidate[channel]

    const newHsla = {
      ...hsla,
      [channel]: value,
    }

    if (Number.isNaN(value)) {
      if (channel === 'a') {
        setHsla({
          ...hsla,
          [channel]: 1,
        })
      }

      setHsla({
        ...hsla,
        [channel]: 0,
      })
    }

    if (regex.test(value.toString())) {
      const newColor = transformColor('hsla', newHsla)
      setSelfColor(newColor)
      setInputColor(newColor.hex)
      setHsla(newHsla)
    }
  }

  return (
    <div className={`${baseClass}__input-wrapper`}>
      <label>HSLA</label>
      <NumberInput
        label="H"
        name="hsla_h"
        max={360}
        min={0}
        step={1}
        value={roundNumber(hsla.h, 0)}
        onChange={handleHslaChange}
      />
      <NumberInput
        label="S"
        name="hsla_s"
        max={100}
        min={0}
        step={1}
        value={roundNumber(hsla.s, 0)}
        onChange={handleHslaChange}
      />
      <NumberInput
        label="L"
        name="hsla_l"
        max={100}
        min={0}
        step={1}
        value={roundNumber(hsla.l, 0)}
        onChange={handleHslaChange}
      />
      <NumberInput
        label="A"
        name="hsla_a"
        max={1}
        min={0}
        step={0.01}
        value={roundNumber(hsla.a, 2)}
        onChange={handleHslaChange}
      />
      <CopyButton inputType="hsla" />
    </div>
  )
}
