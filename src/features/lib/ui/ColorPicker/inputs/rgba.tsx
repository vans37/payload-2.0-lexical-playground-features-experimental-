import React from 'react'
import { baseClass } from '../ColorPicker'
import useColorPickerContext from '../Context'
import { roundNumber, transformColor } from '../converters'
import { zeroTo1Regex, zeroTo255Regex } from './regex'
import NumberInput from './number'
import CopyButton from './copy'

const rgbaValidate = {
  r: zeroTo255Regex,
  g: zeroTo255Regex,
  b: zeroTo255Regex,
  a: zeroTo1Regex,
}

const RgbaInput = () => {
  const { rgba, setRgba, setSelfColor, setInputColor } = useColorPickerContext()

  const handleRgbaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    const inputName = e.target.name
    const channel = inputName.replace('rgba_', '')
    const regex = rgbaValidate[channel]

    const newRgba = {
      ...rgba,
      [inputName.replace('rgba_', '')]: value || 0,
    }

    if (Number.isNaN(value)) {
      if (channel === 'a') {
        setRgba({
          ...rgba,
          [channel]: 1,
        })
      }

      setRgba({
        ...rgba,
        [channel]: 0,
      })
    }

    if (regex.test(newRgba[channel])) {
      const newColor = transformColor('rgba', newRgba)
      setSelfColor(newColor)
      setInputColor(newColor.hex)
      setRgba(newRgba)
    }
  }

  return (
    <React.Fragment>
      <div className={`${baseClass}__input-wrapper`}>
        <label>RGBA</label>
        <NumberInput
          label="R"
          name="rgba_r"
          max={255}
          min={0}
          step={1}
          value={roundNumber(rgba.r, 0)}
          onChange={handleRgbaChange}
        />
        <NumberInput
          label="G"
          name="rgba_g"
          max={255}
          min={0}
          step={1}
          value={roundNumber(rgba.g, 0)}
          onChange={handleRgbaChange}
        />
        <NumberInput
          label="B"
          name="rgba_b"
          max={255}
          min={0}
          step={1}
          value={roundNumber(rgba.b, 0)}
          onChange={handleRgbaChange}
        />
        <NumberInput
          label="A"
          name="rgba_a"
          max={1}
          min={0}
          step={0.01}
          value={roundNumber(rgba.a, 2)}
          onChange={handleRgbaChange}
        />
        <CopyButton inputType="rgba" />
      </div>
    </React.Fragment>
  )
}

export default RgbaInput
