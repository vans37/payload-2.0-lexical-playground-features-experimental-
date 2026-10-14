import { AIAssistantFeatureProps } from '../../../custom/AI'
import GoogleGeminiAdapter from '../../../custom/AI/plugin/adapters/googleGemini'
import { i18n } from './i18n'

//note that this key will be exposed to the admin panel of payload
const key = ''

const adapter = new GoogleGeminiAdapter(key)

const aiAssistantProps: AIAssistantFeatureProps = {
  useNestedEditor: true,
  adapter: adapter,
  translation: i18n,
}

export default aiAssistantProps
