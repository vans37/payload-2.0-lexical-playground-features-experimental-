import React from 'react'
import { createContext, useCallback, useContext, useState } from 'react'
import { Color, HSLA, HSVA, RGBA } from './types'
import { transformColor } from './converters'

export type ColorPickerContextType = {
  hex: string
  setHex: (hex: string) => void
  rgba: RGBA
  setRgba: (rgba: RGBA) => void
  hsva: HSVA
  setHsva: (hsva: HSVA) => void
  hsla: HSLA
  setHsla: (hsla: HSLA) => void
  alpha: number
  setAlpha: (alpha: number) => void
  initialColor: string
  inputColor: string
  setInputColor: (color: string) => void
  selfColor: Color
  setSelfColor: (color: Color) => void
  handleOnEnterBlur: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const defaultColorPickerContext: ColorPickerContextType = {
  hex: '#00000000',
  setHex: (hex: string) => {
    return
  },
  rgba: {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  },
  setRgba: (rgba: RGBA) => {
    return
  },
  hsva: {
    h: 360,
    s: 100,
    v: 100,
    a: 1,
  },
  setHsva: (hsva: HSVA) => {
    return
  },
  hsla: {
    h: 360,
    s: 100,
    l: 100,
    a: 1,
  },
  setHsla: (hsla: HSLA) => {
    return
  },
  alpha: 1,
  setAlpha: (alpha: number) => {
    return
  },
  initialColor: '#00000000',
  inputColor: '#00000000',
  setInputColor: (color: string) => {
    return
  },
  selfColor: {
    hex: '#00000000',
    rgba: {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    },
    hsva: {
      h: 360,
      s: 100,
      v: 100,
      a: 1,
    },
    hsla: {
      h: 360,
      s: 100,
      l: 100,
      a: 1,
    },
  },
  setSelfColor: (color: Color) => {
    return
  },
  handleOnEnterBlur: (e: React.KeyboardEvent<HTMLInputElement>) => {
    return
  },
}

const ColoPickerContext = createContext(defaultColorPickerContext)

export const ColorPickerContextProvider = ({
  children,
  color,
}: {
  children: React.ReactNode
  color: string
}) => {
  const [initialColor, setInitialColor] = useState(color)
  const [selfColor, setContextSelfColor] = useState(transformColor('hex', color))
  const [inputColor, setContextInputColor] = useState(color)

  const [hex, setContextHex] = useState(transformColor('hex', color).hex)
  const [rgba, setContextRgba] = useState(transformColor('hex', color).rgba)
  const [hsva, setContextHsva] = useState(transformColor('hex', color).hsva)
  const [hsla, setContextHsla] = useState(transformColor('hex', color).hsla)
  const [alpha, setContextAlpha] = useState(1)

  const setSelfColor = useCallback(
    (color: Color) => setContextSelfColor(color),
    [setContextSelfColor],
  )

  const setInputColor = useCallback(
    (color: string) => setContextInputColor(color),
    [setContextInputColor],
  )

  const handleOnEnterBlur = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    }
  }, [])

  const setHex = useCallback((hex: string) => setContextHex(hex), [setContextHex])
  const setRgba = useCallback((rgba: RGBA) => setContextRgba(rgba), [setContextRgba])
  const setHsva = useCallback((hsva: HSVA) => setContextHsva(hsva), [setContextHsva])
  const setHsla = useCallback((hsla: HSLA) => setContextHsla(hsla), [setContextHsla])
  const setAlpha = useCallback((alpha: number) => setContextAlpha(alpha), [setContextAlpha])

  return (
    <ColoPickerContext.Provider
      value={{
        hex,
        rgba,
        hsva,
        hsla,
        alpha,
        initialColor,
        selfColor,
        inputColor,
        setHex,
        setRgba,
        setHsva,
        setHsla,
        setAlpha,
        setSelfColor,
        setInputColor,
        handleOnEnterBlur,
      }}
    >
      {children}
    </ColoPickerContext.Provider>
  )
}

const useColorPickerContext = () => {
  const context = useContext(ColoPickerContext)
  return context
}

export default useColorPickerContext
