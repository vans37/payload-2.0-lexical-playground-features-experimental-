import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SelectableImage } from '../LazyImage'
import { CAN_USE_DOM } from '@payloadcms/richtext-lexical'
import { baseClass } from '../UploadsDrawerMain'
import { ImageDataTypeWithSlug } from '../../../../Shared/types'
import { useGallery } from '../../../store'

const ResizeButton = ({ setResizing }: { setResizing: (v: boolean) => void }) => {
  return (
    <div
      className={`${baseClass}__sidebar-resizer`}
      onMouseDown={() => {
        setResizing(true)
      }}
    >
      <svg viewBox="0 0 18 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="8" r="1" />
        <circle cx="11" cy="8" r="1" />
        <circle cx="7" cy="12" r="1" />
        <circle cx="11" cy="12" r="1" />
        <circle cx="7" cy="16" r="1" />
        <circle cx="11" cy="16" r="1" />
      </svg>
    </div>
  )
}

//m breakpoint
const threshold = 1024

const SelectionSidebar = ({
  adminThumbnail,
  onSelect,
  drawerRef,
  isResizable,
}: {
  adminThumbnail: any
  onSelect?: (selectedUpload: ImageDataTypeWithSlug) => any
  drawerRef: React.MutableRefObject<HTMLDivElement>
  isResizable: boolean
}) => {
  const { t } = useTranslation('multiselect_drawer')
  const [minWidth, setMinWidth] = useState(0)
  const [sidebarWidth, setSidebarWidth] = useState<number>(minWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window?.innerWidth)

  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (windowWidth > threshold) {
      setSidebarOpen(true)
    }
  }, [windowWidth])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window?.innerWidth)
      calcMinWidth()
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const calcMinWidth = useCallback(() => {
    const minWidth = (drawerRef?.current?.clientWidth * 30) / 100
    setMinWidth(minWidth)
    setSidebarWidth(minWidth)
  }, [drawerRef, setMinWidth, setSidebarWidth])

  useEffect(() => {
    calcMinWidth()
  }, [drawerRef.current])

  const handleVisibilityToggle = () => {
    setSidebarOpen((prev) => {
      drawerRef.current.classList.remove('sidebar-visible')
      drawerRef.current.classList.remove('sidebar-hidden')
      const classname = prev ? 'sidebar-hidden' : 'sidebar-visible'
      drawerRef.current.classList.add(classname)
      return !prev
    })
  }

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const width = e.clientX - sidebarRef.current.getBoundingClientRect().left
        if (!isNaN(width) && width >= minWidth) {
          setSidebarWidth(width)
        }
      }
    },
    [isResizing, minWidth],
  )

  useEffect(() => {
    const stopResizing = () => {
      setIsResizing(false)
    }

    if (CAN_USE_DOM) {
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', stopResizing)
    }

    return () => {
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', stopResizing)
    }
  }, [handleResize])

  return (
    <div
      ref={sidebarRef}
      className={`${baseClass}__selection-sidebar ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}
      style={{
        flexBasis: `${sidebarWidth}px`,
      }}
    >
      <div className={`${baseClass}__sidebar_toggler`}>
        <div
          className={`${baseClass}__toggle_visiblity ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}
          onClick={handleVisibilityToggle}
        />
      </div>
      <div className={`${baseClass}__content`}>
        <div className={`${baseClass}__sidebar_controls`}>
          <div className={`${baseClass}__selection-count`}>
            {t('selected')}: <span className="counter">{selection.length}</span>
          </div>
        </div>
        {selection && selection.length === 0 && (
          <div className={`${baseClass}__message`}>{t('nothing_selected')}</div>
        )}
        {selection && selection.length > 0 && (
          <div className={`${baseClass}__selected-items`}>
            {selection.map((item, idx) => (
              <SelectableImage
                key={idx}
                showMediaInfo={false}
                baseClass={`${baseClass}__sidebar-image-wrapper`}
                upload={item}
                adminThumbnail={adminThumbnail}
                isSelected={true}
              />
            ))}
          </div>
        )}
      </div>
      {isResizable && <ResizeButton setResizing={(v) => setIsResizing(v)} />}
    </div>
  )
}

export default SelectionSidebar
