import './Edit.scss'
import type { LexicalEditor, NodeKey } from 'lexical'
import { $getNodeByKey } from 'lexical'
import * as React from 'react'
import { useState } from 'react'
import { Button } from 'payload/components'
import { useTranslation } from 'react-i18next'
import { InlineImageNode, Position } from '../InlineImageNode'
import TextInput from '../../../../../lib/ui/TextInput/TextInput'
import Select from '../../../../../lib/ui/Select/Select'

export const EditInlineImage = ({
  activeEditor,
  nodeKey,
  toggleDrawer,
  drawerSlug,
}: {
  activeEditor: LexicalEditor
  nodeKey: NodeKey
  toggleDrawer: (slug: string) => void
  drawerSlug: string
}): JSX.Element => {
  const editorState = activeEditor.getEditorState()
  const node = editorState.read(() => $getNodeByKey(nodeKey) as InlineImageNode)
  const [altText, setAltText] = useState(node.getAltText())
  const [position, setPosition] = useState<Position>(node.getPosition())

  const { t } = useTranslation('inline_image')

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosition(e.target.value as Position)
  }

  const handleOnConfirm = () => {
    const payload = { altText, position }
    if (node) {
      activeEditor.update(() => {
        node.update(payload)
      })
    }
    toggleDrawer(drawerSlug)
  }

  return (
    <div className="inline-image-edit">
      <div style={{ marginBottom: '1em' }}>
        <TextInput
          label={t('modal.alt_label')}
          onChange={setAltText}
          value={altText}
          data-test-id="image-modal-alt-text-input"
        />
      </div>

      <Select
        style={{ marginBottom: '1em', width: '208px' }}
        value={position}
        label={t('modal.position_label')}
        name="position"
        id="position-select"
        onChange={handlePositionChange}
      >
        <option value="left">{t('modal.left')}</option>
        <option value="right">{t('modal.right')}</option>
        <option value="full">{t('modal.full')}</option>
      </Select>
      <Button data-test-id="image-modal-file-upload-btn" onClick={() => handleOnConfirm()}>
        {t('modal.confirm')}
      </Button>
    </div>
  )
}
