import React, { useState } from 'react'
import { ImageDataType } from '../../types'

import './style.scss'

export default function ViewFileData({ fileData }: { fileData: ImageDataType }) {
  const [isHidden, setIsHidden] = useState(true)

  const styleName = 'view-file-data'

  if (!fileData) {
    return null
  }

  return (
    <>
      <div
        onMouseOver={() => setIsHidden(false)}
        onMouseLeave={() => setIsHidden(true)}
        className={`${styleName}-icon`}
      >
        i
      </div>
      <div className={`${styleName}-container ${!isHidden ? 'active' : ''}`}>
        <div className={`content`}>
          {Object.keys(fileData).map((key) => (
            <div className={`content-key-value`}>
              <div className={`key`}>{key.toString()}:</div>
              <div className={`value`}>{fileData[key].toString()}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
