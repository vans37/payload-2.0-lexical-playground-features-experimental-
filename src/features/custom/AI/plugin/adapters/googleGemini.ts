import type {
  AIAdapter,
  AIRequest,
  AIResponse,
  ModelCapabilities,
  ReadableStreamResponse,
} from './interface'

/* 
  Very basic implementation to bootstrap text generation. 
  https://ai.google.dev/api
*/

export type GoogleAIModels =
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro'
  | 'gemini-1.0-pro'
  | 'text-embedding-004'
  | 'aqa'

export type Task =
  | 'generateContent'
  | 'streamGenerateContent'
  | 'countTokens'
  | 'embedContent'
  | 'batchEmbedContents'

export interface GenerationConfig {
  candidateCount?: number
  stopSequences?: string[]
  maxOutputTokens?: number
  temperature?: number
  topP?: number
  topK?: number
  responseMimeType?: 'text/plain' | 'application/json'
  responseSchema?: Record<string, any>
}

export interface Content {
  role: string
  parts: Part[]
}

type Part = TextPart

interface TextPart {
  text: string
  inlineData?: never
  functionCall?: never
  functionResponse?: never
  fileData?: never
  executableCode?: never
  codeExecutionResult?: never
}

/* 
  All adapters must implement AIAdapter interface for unification purposes.
  Adapter model generate()/streamGenerate() recieves text as input (your promt), and outputs text or ReadableStream, which 
  contains your model response. 
  If a model ouputs text as a markdown string, frontend will render markdown preview response and transform
  markdown string to lexical nodes via its api, no special tranformations required.
  For now frontend supports only text generations, no image, video, file, audio inference/generations is supported.
  Feel free to add your own functionality. 
*/

export default class GoogleGeminiAdapter implements AIAdapter {
  private API_KEY: string
  private defaultURL: string = 'https://generativelanguage.googleapis.com'
  private defaultAPIVersion: string = 'v1beta'
  private model: GoogleAIModels = 'gemini-1.5-flash'
  private task: Task = 'generateContent'
  private url: string
  private capabilities: ModelCapabilities = {
    textGeneration: true,
    streaming: true,
  }
  private generationConfig: GenerationConfig = {
    temperature: 1,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  }
  private contents: Content[] = []

  constructor(apiKey: string) {
    this.API_KEY = apiKey
    this.url = `${this.defaultURL}/${this.defaultAPIVersion}/models/${this.model}:${this.task}?key=${this.API_KEY}`
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const content = {
      role: 'user',
      parts: [
        {
          text: request.prompt,
        },
      ],
    }

    this.addContent(content)

    const requestBody = {
      contents: this.contents,
      generationConfig: this.generationConfig,
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    const textData = getText(data)

    return {
      content: textData || '',
    }
  }

  //preferable way to generate content as a stream if model supports streaming
  async streamGenerate(
    request: AIRequest,
  ): Promise<ReadableStream<ReadableStreamResponse> | undefined> {
    //switch model task to generate response as a stream
    this.setTask('streamGenerateContent')
    this.setUrl(
      `${this.defaultURL}/${this.defaultAPIVersion}/models/${this.model}:${this.task}?alt=sse&key=${this.API_KEY}`,
    )

    const content = {
      role: 'user',
      parts: [
        {
          text: request.prompt,
        },
      ],
    }

    this.addContent(content)

    const requestBody = {
      contents: this.contents,
      generationConfig: this.generationConfig,
    }

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (response && response?.body) {
      const reader = response.body.getReader()

      //https://github.com/google-gemini/generative-ai-js/blob/main/src/requests/stream-reader.ts
      const responseLineRE = /^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/

      return new ReadableStream({
        start(controller) {
          let textChunks = ''
          let chunkIndex = 0
          const decoder = new TextDecoder()

          function pump() {
            return reader.read().then(({ value, done }) => {
              if (done) {
                controller.close()
                return
              }

              chunkIndex++

              textChunks += decoder.decode(value, { stream: true })

              let match = textChunks.match(responseLineRE)
              let parsedResponse

              while (match) {
                try {
                  parsedResponse = JSON.parse(match[1])
                } catch (e) {
                  throw new Error(`Error parsing JSON response: ${match[1]}`)
                }

                let text = ''

                if (parsedResponse?.candidates?.length > 0) {
                  text = parsedResponse.candidates[0].content?.parts[0]?.text
                }

                const chunk = {
                  index: chunkIndex,
                  text,
                }

                controller.enqueue(chunk)
                textChunks = textChunks.substring(match[0].length)
                match = textChunks.match(responseLineRE)
              }

              return pump()
            })
          }

          return pump()
        },
      })
    }
  }

  getContent(): Content[] {
    return this.contents
  }

  addContent(content: Content) {
    this.contents.push(content)
  }

  setContent(content: Content[]) {
    this.contents = content
  }

  getGenerationConfig(): GenerationConfig {
    return this.generationConfig
  }

  setGenerationConfig(config: GenerationConfig): void {
    this.generationConfig = config
  }

  getCapabilities(): ModelCapabilities {
    return this.capabilities
  }

  setCapabilities(cap: ModelCapabilities) {
    this.capabilities = cap
  }

  getModel() {
    return this.model
  }

  setModel(model: GoogleAIModels) {
    this.model = model
  }

  setTask(task: Task) {
    this.task = task
  }

  getDefaultURL(): string {
    return this.defaultURL
  }

  setDefaultURL(url: string): void {
    this.defaultURL = url
  }

  getDefaultAPIVersion(): string {
    return this.defaultAPIVersion
  }

  setDefaultAPIVersion(version: string): void {
    this.defaultAPIVersion = version
  }

  setUrl(url: string) {
    this.url = url
  }
}

export function getText(response: any): string {
  const textStrings = []
  if (response.candidates?.[0].content?.parts) {
    for (const part of response.candidates?.[0].content?.parts) {
      if (part.text) {
        textStrings.push(part.text)
      }
      if (part.executableCode) {
        textStrings.push(
          '\n```' + part.executableCode.language + '\n' + part.executableCode.code + '\n```\n',
        )
      }
      if (part.codeExecutionResult) {
        textStrings.push('\n```\n' + part.codeExecutionResult.output + '\n```\n')
      }
    }
  }
  if (textStrings.length > 0) {
    return textStrings.join('')
  } else {
    return ''
  }
}
