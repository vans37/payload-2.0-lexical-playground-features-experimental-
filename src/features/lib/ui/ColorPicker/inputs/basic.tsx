import React from 'react'
import { baseClass } from '../ColorPicker'
import useColorPickerContext from '../Context'
import { transformColor } from '../converters'

const basicColors = [
  '#d0021bff',
  '#f5a623ff',
  '#f8e71cff',
  '#8b572aff',
  '#7ed321ff',
  '#417505ff',
  '#bd10e0ff',
  '#9013feff',
  '#4a90e2ff',
  '#50e3c2ff',
  '#b8e986ff',
  '#000000ff',
  '#4a4a4aff',
  '#9b9b9bff',
  '#ffffffff',
]

const BasicColorsInput = ({ predefinedColors }: { predefinedColors: string[] | null }) => {
  const { selfColor, setInputColor, setSelfColor } = useColorPickerContext()

  if (predefinedColors && predefinedColors.length > 0) {
    return (
      <div className={`${baseClass}__basic-colors`}>
        {predefinedColors.map((basicColor) => (
          <button
            className={basicColor === selfColor.hex ? ' active' : ''}
            key={basicColor}
            style={{ backgroundColor: basicColor }}
            onClick={() => {
              setInputColor(basicColor)
              setSelfColor(transformColor('hex', basicColor))
            }}
          />
        ))}
      </div>
    )
  } else {
    return (
      <div className={`${baseClass}__basic-colors`}>
        {basicColors.map((basicColor) => (
          <button
            className={basicColor === selfColor.hex ? ' active' : ''}
            key={basicColor}
            style={{ backgroundColor: basicColor }}
            onClick={() => {
              setInputColor(basicColor)
              setSelfColor(transformColor('hex', basicColor))
            }}
          />
        ))}
      </div>
    )
  }
}

export default BasicColorsInput
