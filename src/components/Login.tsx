import { useEffect, useState } from 'react'
import type { AuthState } from '../auth'
import { tr } from '../i18n/core'

type Mode = 'signin' | 'signup' | 'reset'

// Firebase-felkoder till begripliga meddelanden
const message = (e: unknown) => {
  const code = (e as { code?: string }).code ?? ''
  const map: Record<string, string> = {
    'auth/invalid-credential': 'Fel e-post eller lösenord.',
    'auth/wrong-password': 'Fel e-post eller lösenord.',
    'auth/user-not-found': 'Det finns inget konto med den e-posten. Skapa ett konto först.',
    'auth/invalid-email': 'E-postadressen ser inte rätt ut.',
    'auth/email-already-in-use': 'Det finns redan ett konto med den e-posten. Logga in i stället.',
    'auth/weak-password': 'Lösenordet måste vara minst 6 tecken.',
    'auth/too-many-requests': 'För många försök. Vänta en stund och försök igen.',
    'auth/network-request-failed': 'Ingen anslutning. Kontrollera internet och försök igen.',
    'auth/operation-not-allowed': 'Inloggning med e-post är inte aktiverad än. Be Victor slå på den i Firebase.',
    'auth/popup-closed-by-user': '',
  }
  return code in map ? tr(map[code]) : (e as Error).message
}

export function Login({ auth }: { auth: AuthState }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>, ok?: string) => {
    setBusy(true)
    setErr('')
    setInfo('')
    try {
      await fn()
      if (ok) setInfo(ok)
    } catch (e) {
      setErr(message(e))
    } finally {
      setBusy(false)
    }
  }

  const submit = () =>
    mode === 'signin'
      ? run(() => auth.signInEmail(email, password))
      : mode === 'signup'
        ? run(() => auth.signUpEmail(email, password, name))
        : run(() => auth.resetPassword(email), tr('Om det finns ett konto för {email} har vi skickat en länk för att välja nytt lösenord.', { email: email.trim() }))

  return (
    <div className="splash">
      <div className="login">
        <img className="login-logo" src="/haugaards_training_logo.png" alt="Haugaards training" draggable={false} />
        <p className="muted">{tr('Logga in för att se och planera träningen.')}</p>
        <button className="btn primary big" disabled={busy} onClick={() => run(auth.signIn)}>
          {tr('Fortsätt med Google')}
        </button>

        <div className="login-or">
          <span>{tr('eller med e-post')}</span>
        </div>

        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          {mode === 'signup' && <input autoComplete="given-name" placeholder={tr('Förnamn')} value={name} onChange={(e) => setName(e.target.value)} />}
          <input type="email" autoComplete="email" inputMode="email" placeholder={tr('E-postadress')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          {mode !== 'reset' && (
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder={tr(mode === 'signup' ? 'Välj lösenord (minst 6 tecken)' : 'Lösenord')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          )}
          <button className="btn big" disabled={busy}>
            {tr(mode === 'signin' ? 'Logga in' : mode === 'signup' ? 'Skapa konto' : 'Skicka länk')}
          </button>
        </form>

        <div className="login-links">
          {mode !== 'signin' && <button onClick={() => (setMode('signin'), setErr(''), setInfo(''))}>{tr('Jag har redan ett konto')}</button>}
          {mode !== 'signup' && <button onClick={() => (setMode('signup'), setErr(''), setInfo(''))}>{tr('Skapa konto med e-post')}</button>}
          {mode === 'signin' && <button onClick={() => (setMode('reset'), setErr(''), setInfo(''))}>{tr('Glömt lösenordet?')}</button>}
        </div>

        {err && <p className="error">{err}</p>}
        {info && <p className="muted small">{info}</p>}
        <p className="muted small">
          <a href="#/privacy">{tr('Integritetspolicy')}</a> · <a href="#/terms">{tr('Användarvillkor')}</a>
        </p>
      </div>
    </div>
  )
}

// Visas för e-postkonton tills adressen är bekräftad (Firestore-reglerna kräver det)
export function VerifyEmail({ auth }: { auth: AuthState }) {
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const email = auth.user?.email ?? ''

  // Kolla automatiskt när man kommer tillbaka till fliken efter att ha klickat på länken
  useEffect(() => {
    const on = () => document.visibilityState === 'visible' && void auth.refresh().catch(() => {})
    document.addEventListener('visibilitychange', on)
    window.addEventListener('focus', on)
    return () => (document.removeEventListener('visibilitychange', on), window.removeEventListener('focus', on))
  }, [auth])

  return (
    <div className="splash">
      <div className="login">
        <img className="login-logo" src="/haugaards_training_logo.png" alt="Haugaards training" draggable={false} />
        <h1>{tr('Bekräfta din e-post')}</h1>
        <p className="muted">{tr('Vi har skickat en länk till {email}. Öppna mejlet och klicka på länken, kom sedan tillbaka hit. Kolla skräpposten om det inte syns.', { email })}</p>
        <button
          className="btn primary big"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            const ok = await auth.refresh().catch(() => false)
            setBusy(false)
            if (!ok) setInfo(tr('Adressen är inte bekräftad än. Klicka på länken i mejlet först.'))
          }}
        >
          {tr('Jag har bekräftat')}
        </button>
        <div className="login-links">
          <button onClick={() => auth.resendVerification().then(() => setInfo(tr('Ett nytt mejl är skickat.')), () => setInfo(tr('För många försök. Vänta en stund och försök igen.')))}>{tr('Skicka mejlet igen')}</button>
          <button onClick={() => auth.signOut()}>{tr('Logga ut')}</button>
        </div>
        {info && <p className="muted small">{info}</p>}
      </div>
    </div>
  )
}
