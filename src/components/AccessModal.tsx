import { useState } from 'react'
import { ADMIN_EMAILS, grantAccess, normEmail, revokeAccess, useAccessList, validEmail } from '../lib/access'
import { tr } from '../i18n/core'
import { Modal } from './Modal'

// Admins lägger till och tar bort konton som får logga in. Alla delar samma hushållsdata.
export function AccessModal({ me, onClose }: { me: string; onClose: () => void }) {
  const { list, error } = useAccessList(true)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const addr = normEmail(email)
  const exists = ADMIN_EMAILS.includes(addr) || !!list?.some((a) => a.email === addr)

  const add = async () => {
    if (!validEmail(addr) || exists) return
    setBusy(true)
    setErr('')
    try {
      await grantAccess(addr, me)
      setEmail('')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={tr('Hantera åtkomst')} onClose={onClose}>
      <p className="muted small">
        {tr('Lägg till Google-kontot (e-postadressen) för den som ska få logga in. Alla med åtkomst ser och kan ändra hela familjens planer. Första gången de loggar in får de skapa sin egen plan.')}
      </p>
      <form
        className="access-add"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <input type="email" placeholder="namn@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus aria-label={tr('E-postadress')} />
        <button className="btn primary" disabled={busy || !validEmail(addr) || exists}>
          {tr('Lägg till')}
        </button>
      </form>
      {exists && addr && <p className="muted small">{tr('{email} har redan åtkomst.', { email: addr })}</p>}
      {(err || error) && <p className="error">{err || error}</p>}
      <ul className="access-list">
        {ADMIN_EMAILS.map((a) => (
          <li key={a}>
            <span>{a}</span>
            <em>{tr('Admin')}</em>
          </li>
        ))}
        {list?.map((a) => (
          <li key={a.email}>
            <span>{a.email}</span>
            <button
              className="btn small danger"
              onClick={() => confirm(tr('Ta bort åtkomsten för {email}? Planerna finns kvar.', { email: a.email })) && revokeAccess(a.email).catch((e: Error) => setErr(e.message))}
            >
              {tr('Ta bort')}
            </button>
          </li>
        ))}
      </ul>
      {list && !list.length && <p className="muted small">{tr('Inga fler konton har lagts till än.')}</p>}
    </Modal>
  )
}
