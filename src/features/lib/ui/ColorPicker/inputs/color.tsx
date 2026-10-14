import React from 'react'
import useColorPickerContext from '../Context'
import { baseClass } from '../ColorPicker'

const Color = ({ color }: { color: string }) => {
  const { selfColor } = useColorPickerContext()

  return <div className={`${baseClass}__color`} style={{ backgroundColor: color }} />
}

export default Color
