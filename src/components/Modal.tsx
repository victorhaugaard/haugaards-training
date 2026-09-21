import { useEffect, type ReactNode } from 'react'
import { tr } from '../i18n/core'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
  actions?: ReactNode
}

export function Modal({ title, onClose, children, footer, wide, actions }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-label={title}>
        <header className="modal-head">
          <h2>{title}</h2>
          <div className="modal-actions">
            {actions}
            <button className="icon-btn" onClick={onClose} aria-label={tr('Stäng')}>
              ✕
            </button>
          </div>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  )
}
