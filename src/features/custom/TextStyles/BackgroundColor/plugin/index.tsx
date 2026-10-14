import * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $patchStyleText } from '@lexical/selection'
import type { LexicalCommand } from 'lexical'
import { $getSelection, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical'

import ColorPicker from '../../../../lib/ui/ColorPicker/ColorPicker'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { Button, Drawer } from 'payload/components/elements'
import { useTranslation } from 'react-i18next'
import { useModal } from '@faceless-ui/modal'
import { TextBackgroundFeatureProps } from '..'

export const OPEN_COLOR_PICKER_COMMAND: LexicalCommand<{
  color: string
} | null> = createCommand()

export function TextStylesPlugin(): React.ReactNode {
  const [shouldApplyColor, setShouldApplyColor] = useState(false)
  const [colorPickerValue, setColorPickerValue] = useState<{
    value: string
    skipHistoryStack: boolean
  }>({
    value: '#00000000',
    skipHistoryStack: true,
  })
  const [editor] = useLexicalComposerContext()
  const config = useEditorConfigContext()
  const { toggleModal } = useModal()
  const { t } = useTranslation('color_picker')
  const drawerSlug = `BACKGROUND_COLOR_MODAL_${config?.field?.path}`

  const predefinedColors = (
    config.editorConfig.resolvedFeatureMap.get('text_background')
      ?.props as TextBackgroundFeatureProps
  )?.predefinedColors

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      editor.update(
        () => {
          const selection = $getSelection()
          if (selection !== null) {
            $patchStyleText(selection, styles)
            setShouldApplyColor(false)
          }
        },
        skipHistoryStack ? { tag: 'historic' } : {},
      )
    },
    [editor],
  )

  useEffect(() => {
    if (shouldApplyColor) {
      applyStyleText(
        { 'background-color': colorPickerValue.value },
        colorPickerValue.skipHistoryStack,
      )
    }
  }, [shouldApplyColor])

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      setColorPickerValue({
        value,
        skipHistoryStack,
      })
    },
    [setColorPickerValue],
  )

  useEffect(() => {
    editor.registerCommand(
      OPEN_COLOR_PICKER_COMMAND,
      (args) => {
        setColorPickerValue({
          value: args.color,
          skipHistoryStack: true,
        })
        toggleModal(drawerSlug)

        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return (
    <Drawer slug={drawerSlug} title={t('title')}>
      <ColorPicker
        onChange={onBgColorSelect}
        color={colorPickerValue.value}
        predefinedColors={predefinedColors}
      />
      <Button
        onClick={() => {
          setShouldApplyColor(true)
          toggleModal(drawerSlug)
        }}
      >
        {t('apply')}
      </Button>
      <Button onClick={() => toggleModal(drawerSlug)}> {t('cancel')}</Button>
    </Drawer>
  )
}
