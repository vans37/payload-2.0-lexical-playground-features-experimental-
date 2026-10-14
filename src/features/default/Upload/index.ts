import type { Field } from 'payload/types'
import payload from 'payload'
import type { HTMLConverter } from '../converters/html/converter/types'
import type { SerializedUploadNode } from './nodes/UploadNode'
import { INSERT_UPLOAD_WITH_DRAWER_COMMAND } from './drawer/commands'
import { UploadNode } from './nodes/UploadNode'
import { uploadPopulationPromiseHOC } from './populationPromise'
import { uploadValidation } from './validate'
import { $isUploadNode, SlashMenuOption } from '@payloadcms/richtext-lexical'
import { toolbarAddDropdownGroupWithItems } from '../Shared/toolbar/addDropdownGroup'
import { $isNodeSelection } from 'lexical'
import { UploadIcon } from '../../lib/ui/icons/Upload'
import { FeatureProviderWithToolbar } from '../../lib/types'
import { i18n } from './i18n'

export type UploadFeatureProps = {
  collections?: {
    [collection: string]: {
      fields: Field[]
    }
  }
  /**
   * Sets a maximum population depth for this upload (not the fields for this upload), regardless of the remaining depth when the respective field is reached.
   * This behaves exactly like the maxDepth properties of relationship and upload fields.
   */
  maxDepth?: number
}

/**
 * Get the absolute URL for an upload URL by potentially prepending the serverURL
 */
function getAbsoluteURL(url: string): string {
  return url?.startsWith('http') ? url : (payload?.config?.serverURL || '') + url
}

export const UploadFeature = (props?: UploadFeatureProps): FeatureProviderWithToolbar => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: UploadNode.getType(),
            converters: {
              html: {
                converter: async ({ node }) => {
                  let uploadDocument: any
                  try {
                    uploadDocument = await payload.findByID({
                      id: node.value.id,
                      collection: node.relationTo,
                    })
                  } catch (ignored) {
                    // eslint-disable-next-line no-console
                    console.error(
                      'Lexical upload node HTML converter: error fetching upload file',
                      ignored,
                      'Node:',
                      node,
                    )
                    return `<img />`
                  }
                  const url: string = getAbsoluteURL(uploadDocument?.url as string)

                  /**
                   * If the upload is not an image, return a link to the upload
                   */
                  if (!(uploadDocument?.mimeType as string)?.startsWith('image')) {
                    return `<a href="${url}" rel="noopener noreferrer">${uploadDocument.filename}</a>`
                  }

                  /**
                   * If the upload is a simple image with no different sizes, return a simple img tag
                   */
                  if (!uploadDocument?.sizes || !Object.keys(uploadDocument?.sizes).length) {
                    return `<img src="${url}" alt="${uploadDocument?.filename}" width="${uploadDocument?.width}"  height="${uploadDocument?.height}"/>`
                  }

                  /**
                   * If the upload is an image with different sizes, return a picture element
                   */
                  let pictureHTML = '<picture>'

                  // Iterate through each size in the data.sizes object
                  for (const size in uploadDocument.sizes) {
                    const imageSize = uploadDocument.sizes[size]

                    // Skip if any property of the size object is null
                    if (
                      !imageSize.width ||
                      !imageSize.height ||
                      !imageSize.mimeType ||
                      !imageSize.filesize ||
                      !imageSize.filename ||
                      !imageSize.url
                    ) {
                      continue
                    }
                    const imageSizeURL: string = getAbsoluteURL(imageSize?.url as string)

                    pictureHTML += `<source srcset="${imageSizeURL}" media="(max-width: ${imageSize.width}px)" type="${imageSize.mimeType}">`
                  }

                  // Add the default img tag
                  pictureHTML += `<img src="${url}" alt="Image" width="${uploadDocument.width}" height="${uploadDocument.height}">`
                  pictureHTML += '</picture>'

                  return pictureHTML
                },
                nodeTypes: [UploadNode.getType()],
              } as HTMLConverter<SerializedUploadNode>,
            },
            node: UploadNode,
            populationPromises: [uploadPopulationPromiseHOC(props)],
            validations: [uploadValidation()],
          },
        ],
        plugins: [
          {
            //@ts-ignore
            Component: () => import('./plugin').then((module) => module.UploadPlugin),
            position: 'normal',
          },
        ],
        props,
        slashMenu: {
          options: [
            {
              displayName: ({ i18n }) => i18n.t('default_upload:slash_menu_title'),
              key: 'basic',
              options: [
                new SlashMenuOption('upload', {
                  Icon: () =>
                    //@ts-ignore
                    import('../../lib/ui/icons/Upload').then((module) => module.UploadIcon),
                  displayName: ({ i18n }) => i18n.t('default_upload:slash_menu_label'),
                  keywords: ['upload', 'image', 'file', 'img', 'picture', 'photo', 'media'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_UPLOAD_WITH_DRAWER_COMMAND, {
                      replace: false,
                    })
                  },
                }),
              ],
            },
          ],
        },
        toolbarFixed: {
          groups: [
            toolbarAddDropdownGroupWithItems([
              {
                ChildComponent: UploadIcon,
                isActive: ({ selection }) => {
                  if (!$isNodeSelection(selection) || !selection.getNodes().length) {
                    return false
                  }

                  const firstNode = selection.getNodes()[0]
                  return $isUploadNode(firstNode)
                },
                key: 'upload',
                label: ({ i18n }) => i18n.t('default_upload:label'),
                onSelect: ({ editor }) => {
                  editor.dispatchCommand(INSERT_UPLOAD_WITH_DRAWER_COMMAND, {
                    replace: false,
                  })
                },
              },
            ]),
          ],
        },
        translation: i18n,
      }
    },
    key: 'upload',
  }
}
