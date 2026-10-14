import React from 'react'
import { baseClass } from '../ColorPicker'
import useColorPickerContext from '../Context'
import { roundNumber } from '../converters'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

type InputType = 'rgba' | 'hsva' | 'hsla'

const CopyButton = ({ inputType }: { inputType: InputType }) => {
  const { rgba, hsla, hsva } = useColorPickerContext()

  const { t } = useTranslation('color_picker')

  let copyString = ''

  const handleOnClick = () => {
    switch (inputType) {
      case 'rgba': {
        copyString = `rgba(${roundNumber(rgba.r, 0)},${roundNumber(rgba.g, 0)},${roundNumber(rgba.b, 0)},${roundNumber(rgba.a, 2)})`
        navigator.clipboard.writeText(copyString)
        toast.info('Copied to clipboard')
        break
      }
      case 'hsla': {
        copyString = `hsla(${roundNumber(hsla.h, 0)},${roundNumber(hsla.s, 0)}%,${roundNumber(hsla.l, 0)}%,${roundNumber(hsla.a, 2)})`
        navigator.clipboard.writeText(copyString)
        toast.info('Copied to clipboard')
        break
      }
      case 'hsva': {
        copyString = `hsva(${roundNumber(hsva.h, 0)},${roundNumber(hsva.s, 0)}%,${roundNumber(hsva.v, 0)}%,${roundNumber(hsva.a, 2)})`
        navigator.clipboard.writeText(copyString)
        toast.info('Copied to clipboard')
        break
      }
      default: {
        return
      }
    }
  }

  return (
    <button className={`${baseClass}__copy_button`} onClick={handleOnClick}>
      {t('copy_button')}
    </button>
  )
}

export default CopyButton
