import { LexicalEditor } from 'lexical'
import { PlaygroundEmbedConfig } from '../../../../../custom/Embed'
import { EmbedMatchResult } from '../../../../../custom/Embed/plugin/AutoEmbedPlugin/LexicalAutoEmbedPlugin'
import { INSERT_TWEET_COMMAND } from './plugin'
import React from 'react'

export const TwitterEmbedConfig: PlaygroundEmbedConfig = {
  // e.g. Tweet or Google Map.
  contentName: 'Tweet',

  exampleUrl: 'https://twitter.com/jack/status/20',

  // Icon for display.
  icon: <i className="icon tweet" />,

  // Create the Lexical embed node from the url data.
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
    editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id)
  },

  // For extra searching.
  keywords: ['tweet', 'twitter'],

  // Determine if a given URL is a match and return url data.
  parseUrl: (text: string) => {
    const match = /^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/.exec(text)

    if (match != null) {
      return {
        id: match[5],
        url: match[1],
      }
    }

    return null
  },

  type: 'tweet',
}
