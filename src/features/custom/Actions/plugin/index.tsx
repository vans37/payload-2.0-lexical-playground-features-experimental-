import * as React from 'react'
import { useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import type { LexicalEditor, SerializedEditorState } from 'lexical'
import { CLEAR_EDITOR_COMMAND } from 'lexical'
import { useField } from 'payload/components/forms'
import { exportFile, importFile } from '../lexical-file'
import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from '../SpeechToText'
import { Button, Drawer } from 'payload/components/elements'
import { useTranslation } from 'react-i18next'
import { useModal } from '@faceless-ui/modal'

import { useInternalization } from '../../I18n/store'
import { MicIcon } from '../../../lib/ui/icons/Mic'
import { ImportIcon } from '../../../lib/ui/icons/Import'
import { ExportIcon } from '../../../lib/ui/icons/Export'
import { TrashIcon } from '../../../lib/ui/icons/Trash'

export const baseClass = 'actions-feature'

export const ActionsPlugin = () => {
  const [editor] = useLexicalComposerContext()
  const [isSpeechToText, setIsSpeechToText] = useState(false)
  const { toggleModal, closeModal } = useModal()
  const config = useEditorConfigContext()
  const { t } = useInternalization('actions_menu')

  const CLEAR_EDITOR_MODAL_SLUG = `clear_editor_modal_${config?.field?.path}`

  const uploadSlug = useRef(
    (config.editorConfig.resolvedFeatureMap.get('images')?.props as any)?.uploadCollectionSlug,
  )

  if (!uploadSlug) {
    throw new Error('Actions: upload collection slug was not provided')
  }

  return (
    <React.Fragment>
      <div className={`${baseClass}__actions`}>
        {SUPPORT_SPEECH_RECOGNITION && (
          <Button
            onClick={() => {
              editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText)
              setIsSpeechToText(!isSpeechToText)
            }}
            className={`${baseClass}__button ${baseClass}__button-mic ' + (isSpeechToText ? 'active' : '')`}
            tooltip={t('speech_to_text_tooltip')}
            aria-label={`${isSpeechToText ? 'Enable' : 'Disable'} speech to text`}
          >
            <div className={`${baseClass}__icon`}>
              <MicIcon />
            </div>
          </Button>
        )}
        <Button
          className={`${baseClass}__button import`}
          onClick={() => importFile(editor)}
          tooltip={t('import')}
          aria-label="Import editor state from JSON"
        >
          <div className={`${baseClass}__icon`}>
            <ImportIcon />
          </div>
        </Button>
        <Button
          className={`${baseClass}__button export`}
          onClick={() =>
            exportFile(
              editor,
              {
                fileName: `editor_state_${new Date().toISOString()}`,
                source: 'editor',
              },
              uploadSlug.current,
            )
          }
          tooltip={t('export')}
          aria-label="Export editor state to JSON"
        >
          <div className={`${baseClass}__icon`}>
            <ExportIcon />
          </div>
        </Button>
        <Button
          className={`${baseClass}__button clear`}
          // disabled={isEditorEmpty}
          onClick={() => {
            toggleModal(CLEAR_EDITOR_MODAL_SLUG)
          }}
          tooltip={t('clear')}
          aria-label="Clear editor contents"
        >
          <div className={`${baseClass}__icon`}>
            <TrashIcon />
          </div>
        </Button>
      </div>
      <Modal
        slug={CLEAR_EDITOR_MODAL_SLUG}
        editor={editor}
        path={config?.field?.path}
        onClose={closeModal}
      />
    </React.Fragment>
  )
}

const Modal = ({
  editor,
  onClose,
  path,
  slug,
}: {
  editor: LexicalEditor
  onClose: (slug: string) => void
  path: any
  slug: string
}): JSX.Element => {
  const { setValue, value } = useField<SerializedEditorState>({ path })
  const { t } = useTranslation('actions_menu')

  const emptyStateValue = {
    root: {
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 0,
      children: [
        {
          children: [],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 0,
        },
      ],
    },
  }

  return (
    <Drawer title={t('clear_editor_modal.title')} slug={slug}>
      {t('clear_editor_modal.confirmation_title')}
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            setValue(emptyStateValue)
            editor.focus()
            onClose(slug)
          }}
        >
          {t('clear_editor_modal.confirm')}
        </Button>{' '}
        <Button
          onClick={() => {
            editor.focus()
            onClose(slug)
          }}
        >
          {t('clear_editor_modal.cancel')}
        </Button>
      </div>
    </Drawer>
  )
}
