export interface Resource {
  [language: string]: ResourceLanguage
}

export interface ResourceLanguage {
  [namespace: string]: ResourceKey
}

export type ResourceKey = {
  [key: string]: any
}
