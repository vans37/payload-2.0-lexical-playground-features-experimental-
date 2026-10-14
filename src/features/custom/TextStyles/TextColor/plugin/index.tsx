import * as React from 'react'
import { $getSelectionStyleValueForProperty, $patchStyleText } from '@lexical/selection'
import { $getSelection, createCommand, COMMAND_PRIORITY_EDITOR, $isRangeSelection } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalCommand } from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import ColorPicker from '../../../../lib/ui/ColorPicker/ColorPicker'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { useModal } from '@faceless-ui/modal'
import { useTranslation } from 'react-i18next'
import { Button, Drawer } from 'payload/components/elements'
import { TextColorFeatureProps } from '..'

export const OPEN_COLOR_PICKER_COMMAND: LexicalCommand<{
  color: string
}> = createCommand()

export function TextColorPlugin(): React.ReactNode {
  const [shouldApplyColor, setShouldApplyColor] = useState(false)
  const [colorPickerValue, setColorPickerValue] = useState<{
    value: string
    skipHistoryStack: boolean
  } | null>({
    value: '#000000FF',
    skipHistoryStack: true,
  })
  const [editor] = useLexicalComposerContext()
  const config = useEditorConfigContext()
  const { toggleModal } = useModal()
  const { t } = useTranslation('color_picker')
  const drawerSlug = `TEXT_FONT_COLOR_MODAL_${config?.field?.path}`

  const predefinedColors = (
    config.editorConfig.resolvedFeatureMap.get('text_color')?.props as TextColorFeatureProps
  )?.predefinedColors

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      editor.update(
        () => {
          const selection = $getSelection()
          if (selection !== null) {
            $patchStyleText(selection, styles)
          }
        },
        skipHistoryStack ? { tag: 'historic' } : {},
      )
    },
    [editor],
  )

  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const color = $getSelectionStyleValueForProperty(selection, 'color', '#000')
        if (color !== '#000') {
          setColorPickerValue({ value: color, skipHistoryStack: false })
        }
      }
    })
  }, [editor, setColorPickerValue])

  useEffect(() => {
    if (shouldApplyColor) {
      applyStyleText({ color: colorPickerValue.value }, colorPickerValue.skipHistoryStack)
      setShouldApplyColor(false)
    }
  }, [shouldApplyColor])

  const onFontColorSelect = useCallback(
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
        toggleModal(drawerSlug)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  return (
    <Drawer slug={drawerSlug} title={t('title')}>
      <ColorPicker
        onChange={onFontColorSelect}
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
