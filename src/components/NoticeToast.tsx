import { useEffect } from 'react'
import { coachById } from '../lib/coaches'
import { tr } from '../i18n/core'
import { CoachAvatar } from './CoachAvatar'

export interface Notice {
  id: string
  coachId: string
  text: string
}

// Tillfällig notis uppe i högra hörnet, som en sms-notis. Klick öppnar chatten.
export function NoticeToast({ notice, onOpen, onClose }: { notice: Notice; onOpen: () => void; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000)
    return () => clearTimeout(t)
  }, [notice.id, onClose])
  const coach = coachById(notice.coachId)
  return (
    <div className="notice" key={notice.id} role="alert" onClick={onOpen}>
      <CoachAvatar coach={coach} size={40} />
      <div className="notice-body">
        <strong>{coach.name}</strong>
        <span>{notice.text}</span>
      </div>
      <button
        className="notice-x"
        aria-label={tr('Stäng')}
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        ✕
      </button>
    </div>
  )
}
