import { EmbedFeatureProps } from '../../../custom/Embed'
import { i18n } from './i18n'
import { toolbarAddDropdownGroupWithItems } from '../../../default/Shared/toolbar/addDropdownGroup'
import { $isRangeSelection } from 'lexical'
import { INSERT_EMBED_COMMAND } from '../../../custom/Embed/plugin/AutoEmbedPlugin/LexicalAutoEmbedPlugin'
import { YoutubeEmbedConfig } from './configs/youtube/config'
import { YouTubeNode } from './configs/youtube/node/YouTubeNode'
import { TwitterEmbedConfig } from './configs/twitter/config'
import { TweetNode } from './configs/twitter/node/TweetNode'
import { RutubeEmbedConfig } from './configs/rutube/config'
import { RutubeNode } from './configs/rutube/node/RutubeNode'
import { VkVideoNode } from './configs/vk/node/VkVideoNode'
import { VkEmbedConfig } from './configs/vk/config'
import VKIcon from './configs/vk/icon'
import RutubeIcon from './configs/rutube/icon'
import TwitterIcon from './configs/twitter/icon'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import YoutubeIcon from './configs/youtube/icon'

const embedFeatureProps: EmbedFeatureProps = {
  embedConfigs: [YoutubeEmbedConfig, TwitterEmbedConfig, RutubeEmbedConfig, VkEmbedConfig],
  plugins: [
    {
      //@ts-ignore
      Component: () => import('./configs/youtube/plugin').then((module) => module.default),
      position: 'normal',
    },
    {
      //@ts-ignore
      Component: () => import('./configs/twitter/plugin').then((module) => module.default),
      position: 'normal',
    },
    {
      //@ts-ignore
      Component: () => import('./configs/rutube/plugin').then((module) => module.default),
      position: 'normal',
    },
    {
      //@ts-ignore
      Component: () => import('./configs/vk/plugin').then((module) => module.default),
      position: 'normal',
    },
  ],
  nodes: [
    {
      type: YouTubeNode.getType(),
      node: YouTubeNode,
    },
    {
      type: TweetNode.getType(),
      node: TweetNode,
    },
    {
      type: RutubeNode.getType(),
      node: RutubeNode,
    },
    {
      type: VkVideoNode.getType(),
      node: VkVideoNode,
    },
  ],
  translation: i18n,
  slashMenu: {
    options: [
      {
        displayName: ({ i18n }) => i18n.t('youtube_embed:slash_menu_title'),
        key: 'custom',
        options: [
          new SlashMenuOption('Youtube', {
            Icon: () =>
              //@ts-ignore
              import('./configs/youtube/icon').then((module) => module.default),
            displayName: ({ i18n }) => i18n.t('youtube_embed:slash_menu_label'),
            keywords: ['youtube', 'video'],
            onSelect: ({ editor }) => {
              editor.dispatchCommand(INSERT_EMBED_COMMAND, 'youtube-video')
            },
          }),
          new SlashMenuOption('Rutube', {
            Icon: () =>
              //@ts-ignore
              import('./configs/rutube/icon').then((module) => module.default),
            displayName: ({ i18n }) => i18n.t('rutube_embed:slash_menu_label'),
            keywords: ['Rutube', 'video'],
            onSelect: ({ editor }) => {
              editor.dispatchCommand(INSERT_EMBED_COMMAND, 'rutube-video')
            },
          }),
          new SlashMenuOption('Vk video', {
            Icon: () =>
              //@ts-ignore
              import('./configs/vk/icon').then((module) => module.default),
            displayName: ({ i18n }) => i18n.t('vk_embed:slash_menu_label'),
            keywords: ['vk', 'video'],
            onSelect: ({ editor }) => {
              editor.dispatchCommand(INSERT_EMBED_COMMAND, 'vk-video')
            },
          }),
        ],
      },
      {
        displayName: ({ i18n }) => i18n.t('twitter_embed:slash_menu_title'),
        key: 'custom',
        options: [
          new SlashMenuOption('Tweet', {
            Icon: () =>
              //@ts-ignore
              import('./configs/twitter/icon').then((module) => module.default),
            displayName: ({ i18n }) => i18n.t('twitter_embed:slash_menu_label'),
            keywords: ['tweet', 'embed'],
            onSelect: ({ editor }) => {
              editor.dispatchCommand(INSERT_EMBED_COMMAND, 'tweet')
            },
          }),
        ],
      },
    ],
  },
  toolbar: {
    toolbarFixed: {
      groups: [
        toolbarAddDropdownGroupWithItems([
          {
            ChildComponent: YoutubeIcon,
            isEnabled: ({ selection }) => {
              if ($isRangeSelection(selection)) {
                return true
              }
              return false
            },
            key: 'youtube',
            label: ({ i18n }) => i18n.t('youtube_embed:label'),
            onSelect: ({ editor }) => {
              editor.update(() => {
                editor.dispatchCommand(INSERT_EMBED_COMMAND, 'youtube-video')
              })
            },
            order: 20,
          },
          {
            ChildComponent: VKIcon,
            isEnabled: ({ selection }) => {
              if ($isRangeSelection(selection)) {
                return true
              }
              return false
            },
            key: 'vk_video',
            label: ({ i18n }) => i18n.t('vk_embed:label'),
            onSelect: ({ editor }) => {
              editor.update(() => {
                editor.dispatchCommand(INSERT_EMBED_COMMAND, 'vk-video')
              })
            },
            order: 20,
          },
          {
            ChildComponent: RutubeIcon,
            isEnabled: ({ selection }) => {
              if ($isRangeSelection(selection)) {
                return true
              }
              return false
            },
            key: 'rutube_video',
            label: ({ i18n }) => i18n.t('rutube_embed:label'),
            onSelect: ({ editor }) => {
              editor.update(() => {
                editor.dispatchCommand(INSERT_EMBED_COMMAND, 'rutube-video')
              })
            },
            order: 20,
          },
          {
            ChildComponent: TwitterIcon,
            isEnabled: ({ selection }) => {
              if ($isRangeSelection(selection)) {
                return true
              }
              return false
            },
            key: 'tweet',
            label: ({ i18n }) => i18n.t('twitter_embed:label'),
            onSelect: ({ editor }) => {
              editor.update(() => {
                editor.dispatchCommand(INSERT_EMBED_COMMAND, 'tweet')
              })
            },
            order: 20,
          },
        ]),
      ],
    },
  },
}

export default embedFeatureProps
