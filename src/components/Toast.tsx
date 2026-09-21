import { useEffect } from 'react'
import { tr } from '../i18n/core'

export interface ToastData {
  id: number
  text: string
  undo?: () => void
}

export function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 7000)
    return () => clearTimeout(t)
  }, [toast.id, onClose])
  return (
    <div className="toast" role="status" key={toast.id}>
      <span>{toast.text}</span>
      {toast.undo && (
        <button
          onClick={() => {
            toast.undo?.()
            onClose()
          }}
        >
          {tr('Ångra')}
        </button>
      )}
    </div>
  )
}
