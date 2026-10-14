import type { LexicalEditor } from 'lexical'
import * as React from 'react'
import { useState } from 'react'
import { baseClass, INSERT_LAYOUT_COMMAND } from '.'

import { useModal } from '@faceless-ui/modal'
import { Button } from 'payload/components/elements'
import { useTranslation } from 'react-i18next'
import DropDown, { DropDownItem } from '../../../lib/ui/DropDown'

const LAYOUTS = [
  { label: '2 columns (equal width)', value: '1fr 1fr' },
  { label: '2 columns (25% - 75%)', value: '1fr 3fr' },
  { label: '3 columns (equal width)', value: '1fr 1fr 1fr' },
  { label: '3 columns (25% - 50% - 25%)', value: '1fr 2fr 1fr' },
  { label: '4 columns (equal width)', value: '1fr 1fr 1fr 1fr' },
]

export default function InsertLayoutDialog({
  activeEditor,
  slug,
}: {
  activeEditor: LexicalEditor
  slug: string
}): JSX.Element {
  const [layout, setLayout] = useState(LAYOUTS[0].value)
  const { toggleModal } = useModal()
  const { t } = useTranslation('layout')

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout)
    toggleModal(slug)
  }

  return (
    <React.Fragment>
      <DropDown
        buttonClassName={`${baseClass}__dialog-dropdown`}
        buttonLabel={t('labels.option_1')}
      >
        {LAYOUTS.map(({ label, value }, index) => {
          const optionKey = `labels.option_${index + 1}`
          return (
            <DropDownItem
              key={value}
              className={`${baseClass}__item`}
              onClick={() => setLayout(value)}
            >
              <span className={`${baseClass}__text`}>{t(optionKey)}</span>
            </DropDownItem>
          )
        })}
      </DropDown>
      <Button onClick={onClick}>{t('insert')}</Button>
    </React.Fragment>
  )
}
