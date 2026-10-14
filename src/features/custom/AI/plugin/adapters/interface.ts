export interface ReadableStreamResponse {
  index: number
  text: string
}

export interface AIAdapter {
  generate(request: AIRequest): Promise<AIResponse>
  streamGenerate(request: AIRequest): Promise<ReadableStream<ReadableStreamResponse> | undefined>
  getCapabilities(): ModelCapabilities
}

export interface ModelCapabilities {
  textGeneration: boolean
  streaming: boolean
  imageGeneration?: boolean
  audioGeneration?: boolean
  imageInference?: boolean
  audioInference?: boolean
  videoInference?: boolean
  documentInference?: boolean
}

export interface AIRequest {
  prompt: string
}

export interface AIResponse {
  content: string
}
