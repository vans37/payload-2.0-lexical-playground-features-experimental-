import { Resource } from '../../../custom/I18n/types'

export const i18n: Resource = {
  ru: {
    actions_menu: {
      speech_to_text_tooltip: 'Речь в текст',
      import: 'Импорт',
      export: 'Экспорт',
      clear: 'Очистить редактор',
      errors: {
        slug_not_provided: 'Actions: не указан slug коллекции загрузок',
      },
      clear_editor_modal: {
        title: 'Очистить редактор',
        confirmation_title: 'Вы уверены, что хотите очистить содержимое редактора?',
        confirm: 'Очистить',
        cancel: 'Отмена',
      },
    },
  },
  en: {
    actions_menu: {
      speech_to_text_tooltip: 'Speech to text',
      import: 'Import',
      export: 'Export',
      clear: 'Clear editor',
      errors: {
        slug_not_provided: 'Actions: upload collection slug was not provided',
      },
      clear_editor_modal: {
        title: 'Clear editor',
        confirmation_title: 'Are you sure you want to clear the editor state?',
        confirm: 'Clear',
        cancel: 'Cancel',
      },
    },
  },
}

export default i18n
