import { Resource } from '../../../custom/I18n/types'

export const i18n: Resource = {
  ru: {
    ai_assistant: {
      label: 'ИИ Ассистент',
      slash_menu_title: 'ИИ',
      slash_menu_label: 'ИИ Ассистент',
      selection: 'Выделение',
      prompt: 'Сообщение',
      cancel: 'Отмена',
      generate: 'Генерация',
      replace: 'Заменить',
      insert: 'Вставить',
      await_response: 'Ожидание ответа сервера...',
      error: {
        general: 'Ошибка',
        text_generation_not_supported: 'Модель не поддерживает генерацию текста',
      },
    },
  },
  en: {
    ai_assistant: {
      label: 'AI Assistant',
      slash_menu_title: 'AI',
      slash_menu_label: 'AI Assistant',
      selection: 'Selection',
      prompt: 'Prompt',
      cancel: 'Cancel',
      generate: 'Generate',
      replace: 'Replace',
      insert: 'Insert',
      await_response: 'Awaiting response...',
      error: {
        general: 'Error',
        text_generation_not_supproted: 'Model does not support text generation',
      },
    },
  },
}
