import './Select.scss'
import * as React from 'react'

type SelectIntrinsicProps = JSX.IntrinsicElements['select']
interface SelectProps extends SelectIntrinsicProps {
  label: string
}

const baseClass = 'select-component'

export default function Select({ children, label, className, ...other }: SelectProps): JSX.Element {
  return (
    <div className={`${baseClass}`}>
      <label style={{ marginTop: '-1em' }} className={`${baseClass}__label`}>
        {label}
      </label>
      <select {...other} className={className || `${baseClass}__select`}>
        {children}
      </select>
    </div>
  )
}
