import { useEffect, useRef } from 'react'
import * as React from 'react'
import useColorPickerContext, { ColorPickerContextProvider } from './Context'
import RgbaInput from './inputs/rgba'
import { AlphaInput } from './inputs/alpha'
import HexInput from './inputs/hex'
import HsvaInput from './inputs/hsva'
import BasicColorsInput from './inputs/basic'
import SaturationInput from './inputs/saturation'
import HueInput from './inputs/hue'
import Color from './inputs/color'
import { HslaInput } from './inputs/hsla'
import './ColorPicker.scss'
import { useTranslation } from 'react-i18next'
import translations from './i18n'

interface ColorPickerProps {
  color: string
  onChange?: (value: string, skipHistoryStack: boolean) => void
  /** #RRGGBBAA */
  predefinedColors?: string[]
}

export const baseClass = 'color-picker'

let skipAddingToHistoryStack = false

export const setSkipAddingToHistoryStack = (v: boolean) => (skipAddingToHistoryStack = v)

const ColorPickerComponent = ({
  onChange,
  predefinedColors,
}: {
  onChange: ColorPickerProps['onChange']
  predefinedColors?: ColorPickerProps['predefinedColors']
}) => {
  const {
    selfColor,
    initialColor,
    setSelfColor,
    setInputColor,
    setHex,
    setAlpha,
    setHsla,
    setHsva,
    setRgba,
    handleOnEnterBlur,
  } = useColorPickerContext()

  const innerDivRef = useRef(null)

  const { t } = useTranslation('color_picker')

  useEffect(() => {
    if (innerDivRef.current !== null && onChange) {
      onChange(selfColor.hex, skipAddingToHistoryStack)
      setInputColor(selfColor.hex)
      setAlpha(selfColor.rgba.a)
      setRgba(selfColor.rgba)
      setHsva(selfColor.hsva)
      setHsla(selfColor.hsla)
      setHex(selfColor.hex)
    }
  }, [selfColor, onChange, setSelfColor, setAlpha, setRgba, setHsva, setHsla, setHex])

  return (
    <div className={`${baseClass}`} ref={innerDivRef}>
      <div className={`${baseClass}__col`}>
        <HexInput handleEnterBlur={handleOnEnterBlur} />
        <RgbaInput />
        <HsvaInput />
        <HslaInput />
        <BasicColorsInput predefinedColors={predefinedColors} />
      </div>
      <div className={`${baseClass}__col`}>
        <SaturationInput />
        <HueInput />
        <AlphaInput />
        <div>{t('current_color')}</div>
        <Color color={selfColor.hex} />
        <div>{t('previous_color')}</div>
        <Color color={initialColor} />
      </div>
    </div>
  )
}

export default function ColorPicker({
  color,
  onChange,
  predefinedColors,
}: Readonly<ColorPickerProps>): JSX.Element {
  const { i18n } = useTranslation()

  useEffect(() => {
    for (const lang of Object.keys(translations)) {
      const namespaces = Object.keys(translations[lang])
      for (const namespace of namespaces) {
        const resource = translations[lang][namespace]
        if (resource) {
          i18n.addResourceBundle(lang, namespace, resource, true, true)
        }
      }
    }
  }, [translations, i18n])

  return (
    <ColorPickerContextProvider color={color}>
      <ColorPickerComponent onChange={onChange} predefinedColors={predefinedColors} />
    </ColorPickerContextProvider>
  )
}
