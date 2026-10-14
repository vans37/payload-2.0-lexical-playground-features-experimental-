import { Modal, useModal } from '@faceless-ui/modal'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import X from './X'
import { Gutter } from './Gutter'
import './modal.scss'

import type { HTMLAttributes } from 'react'

export type Props = {
  children: React.ReactNode
  isOpen: boolean
  close: () => void
  className?: string
  gutter?: boolean
  header?: React.ReactNode
  hoverTitle?: boolean
  slug: string
  title?: string
}

export type TogglerProps = HTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  slug: string
}

const baseClass = 'drawer'
const zBase = 100

export const formatDrawerSlug = ({ depth, slug }: { depth: number; slug: string }): string =>
  `drawer_${depth}_${slug}`

export const DrawerToggler: React.FC<TogglerProps> = ({
  children,
  className,
  disabled,
  onClick,
  slug,
  ...rest
}) => {
  const { openModal } = useModal()

  const handleClick = useCallback(
    (e) => {
      openModal(slug)
      if (typeof onClick === 'function') onClick(e)
    },
    [openModal, slug, onClick],
  )

  return (
    <button className={className} disabled={disabled} onClick={handleClick} type="button" {...rest}>
      {children}
    </button>
  )
}

export const Drawer: React.FC<Props> = ({
  children,
  className,
  gutter = true,
  header,
  hoverTitle,
  slug,
  title,
  isOpen,
  close,
}) => {
  const { t } = useTranslation('general')
  const drawerDepth = 2

  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(isOpen)
  }, [isOpen])

  return (
    <Modal
      className={[
        className,
        baseClass,
        animateIn && `${baseClass}--is-open`,
        drawerDepth > 1 && `${baseClass}--nested`,
      ]
        .filter(Boolean)
        .join(' ')}
      slug={slug}
      style={{
        zIndex: zBase + drawerDepth,
      }}
      openOnInit
    >
      <button
        aria-label={t('close')}
        className={`${baseClass}__close`}
        id={`close-drawer__${slug}`}
        onClick={() => close()}
        type="button"
      />
      <div className={`${baseClass}__content`}>
        <div className={`${baseClass}__blur-bg-content`} />
        <Gutter className={`${baseClass}__content-children`} left={gutter} right={gutter}>
          <>
            {header && header}
            {header === undefined && (
              <div className={`${baseClass}__header`}>
                <h2 className={`${baseClass}__header__title`} title={hoverTitle ? title : null}>
                  {title}
                </h2>
                <button
                  aria-label={t('close')}
                  className={`${baseClass}__header__close`}
                  id={`close-drawer__${slug}`}
                  onClick={() => close()}
                  type="button"
                >
                  <X />
                </button>
              </div>
            )}
            {children}
          </>
        </Gutter>
      </div>
    </Modal>
  )
}
