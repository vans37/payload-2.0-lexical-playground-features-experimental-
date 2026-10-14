import { LexicalEditor } from 'lexical'
import { PlaygroundEmbedConfig } from '../../../../../custom/Embed'
import { EmbedMatchResult } from '../../../../../custom/Embed/plugin/AutoEmbedPlugin/LexicalAutoEmbedPlugin'

import React from 'react'
import { INSERT_RUTUBE_COMMAND } from './plugin'

export const RutubeEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'Rutube видео',

  exampleUrl: 'https://rutube.ru/video/1234abcdef/',
  icon: <i className="icon rutube" />,

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_RUTUBE_COMMAND, result.url)
  },

  keywords: ['rutube', 'video'],

  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match = /^.*(rutube\.ru\/|video|play\/embed)\/([a-zA-Z0-9]+).*/.exec(url)

    const id = match ? (match?.[2].length > 0 ? match[2] : null) : null

    if (id != null) {
      return {
        id,
        url,
      }
    }

    return null
  },

  type: 'rutube-video',
}
