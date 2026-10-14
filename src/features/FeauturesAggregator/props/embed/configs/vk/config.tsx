import { LexicalEditor } from 'lexical'
import { PlaygroundEmbedConfig } from '../../../../../custom/Embed'
import { EmbedMatchResult } from '../../../../../custom/Embed/plugin/AutoEmbedPlugin/LexicalAutoEmbedPlugin'

import React from 'react'
import { INSERT_VKVIDEO_COMMAND, VkVideoPayload } from './plugin'

type MatchData = {
  videoID: string
  ownerID: string
}

export const VkEmbedConfig: PlaygroundEmbedConfig = {
  contentName: 'VK Видео',

  exampleUrl: 'https://vk.com/video/trends?z=video-ownerID_videoID',

  icon: <i className="icon vk" />,

  insertNode: (editor: LexicalEditor, result: EmbedMatchResult<MatchData>) => {
    editor.dispatchCommand(INSERT_VKVIDEO_COMMAND, {
      url: result.url,
      videoID: result?.data?.videoID,
      ownerID: result?.data?.ownerID,
    })
  },

  keywords: ['vk', 'video'],

  parseUrl: async (url: string) => {
    const match = /^.*vk\.com\/video(?:\/[^?]*)?\?z=video((-?\d+)_(\d+)).*/.exec(url)

    const videoID = match ? (match?.[3].length > 0 ? match[3] : null) : null
    const ownerID = match ? (match?.[2].length > 0 ? match[2] : null) : null

    if (videoID != null && ownerID != null) {
      return {
        id: videoID,
        data: {
          videoID,
          ownerID,
        },
        url,
      }
    }

    return null
  },

  type: 'vk-video',
}
