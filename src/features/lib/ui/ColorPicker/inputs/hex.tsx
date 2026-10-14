import React from 'react'
import useColorPickerContext from '../Context'
import { baseClass } from '../ColorPicker'
import { transformColor } from '../converters'

const hexRegValidate = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i

export const HexInput = ({
  handleEnterBlur,
}: {
  handleEnterBlur: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) => {
  const { hex, setHex, setSelfColor } = useColorPickerContext()

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!/^#?[0-9A-Fa-f]*$/.test(value)) return
    setHex(value)
  }

  const handleHexBlur = (e: React.FocusEvent) => {
    if (hexRegValidate.test(hex)) {
      const newColor = transformColor('hex', hex)
      setSelfColor(newColor)
      e.target.removeAttribute('style')
    } else {
      e.target.setAttribute('style', 'border: 1px solid red')
    }
  }

  return (
    <div className={`${baseClass}__input-wrapper`}>
      <label>HEX</label>
      <input
        name="hex"
        onChange={handleHexChange}
        onBlur={handleHexBlur}
        onKeyDown={handleEnterBlur}
        value={hex}
      />
    </div>
  )
}

export default HexInput
