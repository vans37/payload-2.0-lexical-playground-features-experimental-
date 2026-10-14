import React from 'react'

type NumberInputProps = {
  value?: number
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  name?: string
  min?: number
  max?: number
  step?: number
  allowLeadingZero?: boolean
  label?: string
}

const NumberInput = (
  props: NumberInputProps = {
    allowLeadingZero: false,
  },
) => {
  const { name, max, min, step, value, onChange, allowLeadingZero, label } = props

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!allowLeadingZero) {
      if (!isNaN(parseFloat(e.target.value))) {
        e.target.value = parseFloat(e.target.value).toString()
      } else {
        e.target.value = ''
      }
    }
    onChange(e)
  }

  return (
    <React.Fragment>
      {label && <label>{label}</label>}
      <input
        max={max}
        min={min}
        name={name}
        onChange={handleOnChange}
        step={step}
        type="number"
        value={typeof value === 'number' ? value : ''}
      />
    </React.Fragment>
  )
}

export default NumberInput
