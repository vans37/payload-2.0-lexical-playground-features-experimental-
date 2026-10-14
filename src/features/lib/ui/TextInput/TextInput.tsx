import * as React from 'react'
import type { HTMLInputTypeAttribute } from 'react'
import './index.scss'

type Props = Readonly<{
  'data-test-id'?: string
  label: string
  onChange: (val: string) => void
  placeholder?: string
  value: string
  type?: HTMLInputTypeAttribute
}>

const baseClass = 'text-input-component'

const TextInput = ({
  label,
  value,
  onChange,
  placeholder = '',
  'data-test-id': dataTestId,
  type = 'text',
}: Props): JSX.Element => {
  return (
    <div className={`${baseClass}__wrapper`}>
      <label className={`${baseClass}__label`}>{label}</label>
      <input
        type={type}
        className={`${baseClass}__input`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        data-test-id={dataTestId}
      />
    </div>
  )
}

export default TextInput
