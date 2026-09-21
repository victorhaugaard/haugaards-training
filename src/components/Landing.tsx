import { useState } from 'react'
import { daysUntil } from '../lib/dates'
import { RACES } from '../lib/races'
import { Ring } from './Ring'
import { tr, LANGS, getLang } from '../i18n/core'
import { useLang } from '../i18n'
import { CoachAvatar } from './CoachAvatar'
import { COACHES, coachById, readCoach, saveCoach } from '../lib/coaches'
import { WeekDemo } from './WeekDemo'
import { LEGAL } from '../lib/legal'
import { SportIcon } from './SportIcon'

const PILLARS = [
  { value: 0.8, big: '10–15 h', label: 'Träning per vecka', text: 'Skalad från elitens upplägg till en vecka som går att leva med.' },
  { value: 0.75, big: '3 + 1', label: 'Belastningscykel', text: 'Tre veckor som bygger upp, en som låter kroppen ta emot.' },
  { value: 0.9, big: '≈ 90 %', label: 'Lugn träning', text: 'Mycket grund, få hårda pass. Så tränar längdskidåkarna i världseliten.' },
]

// Funktioner under exempelveckan, med en liten ikon var
const FEATURES: { text: string; icon: React.ReactNode }[] = [
  {
    text: 'Coachens beskrivning till varje pass',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5h16v11H10l-5 4v-4H4z" />
      </svg>
    ),
  },
  { text: 'Ercolina, Zwift och Tacx som en del av planen', icon: <SportIcon sport="Cykel" size={22} /> },
  { text: 'Gym eller hemma med lätta redskap', icon: <SportIcon sport="Styrka" size={22} /> },
  {
    text: 'Skonsamt för knäna, mest cykel och rullskidor',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z" />
      </svg>
    ),
  },
]

export function Landing({ onEnter }: { onEnter: () => void }) {
  const { setLang } = useLang()
  const [selId, setSelId] = useState(readCoach)
  const sel = coachById(selId)
  const choose = (id: string) => (setSelId(id), saveCoach(id)) // gäller också i appen
  const [imgOk, setImgOk] = useState(true)
  return (
    <div className="landing">
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <nav className="l-nav">
        <img className="l-logo" src="/haugaards_training_logo.png" alt="Haugaards training" draggable={false} />
        <div className="l-races" aria-label={tr('Dagar kvar till tävlingarna')}>
          {RACES.map((r) => (
            <span key={r.id} title={`${r.name} ${r.date}`}>
              <em>{r.short}</em>
              <b>{Math.max(0, daysUntil(r.date))}</b> d
            </span>
          ))}
        </div>
        <div className="l-lang" aria-label={tr('Språk')}>
          {LANGS.map(([code, label]) => (
            <button key={code} className={code === getLang() ? 'on' : ''} onClick={() => setLang(code)} title={label}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <header className="l-hero">
        <div className="l-copy">
          <p className="l-eyebrow">{tr('Säsongen 2026/2027')}</p>
          <h1>
            {tr('Välkommen till')}
            <br />
            {tr('Haugaards träningsplan')}
          </h1>
          <p className="l-lead">
            {tr('En enkel planerare för längdskidåkning, byggd för Team Haugaard. Följ ett upplägg på skidelitens modell, flytta passen så det passar veckan, checka av och se hur timmar och intensitet faller ut. Från Gsieser Tal Lauf och Vasaloppet till Birkebeinerrennet och Nordenskiöldsloppet.')}
          </p>
          <button className="l-cta" onClick={onEnter}>
            {tr('Öppna planen')} <span>→</span>
          </button>
        </div>

        <div className="l-visual">
          {imgOk && <img src="/hero.jpg" alt="" onError={() => setImgOk(false)} />}
          <div className="l-shade" />
          {!imgOk && (
            <div className="l-art" aria-hidden="true">
              <Ring value={0.9} size={220} stroke={10} color="#4d84ff" />
              <Ring value={0.65} size={160} stroke={10} color="#9dbcff" />
              <Ring value={0.4} size={100} stroke={10} color="#ffffff" />
            </div>
          )}
        </div>
      </header>

      <section className="l-pillars">
        {PILLARS.map((p) => (
          <article key={p.big}>
            <Ring value={p.value} size={52} stroke={4} color="#4d84ff" />
            <div>
              <div className="l-big">{tr(p.big)}</div>
              <div className="l-label">{tr(p.label)}</div>
              <p>{tr(p.text)}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="l-coach">
        <div className="l-coach-main">
          <CoachAvatar coach={sel} size={84} />
          <div>
            <div className="l-label">{tr('Dina coacher')}</div>
            <h2>{tr('Din tränare finns alltid till hands')}</h2>
            <p>{tr('Blir du sjuk, skadar dig eller får ont om tid? Fråga din coach. Coachen flyttar och skjuter upp pass, lägger in rehab, sänker eller ökar mängden och bygger om planen åt dig. Du ser vad som ändrats och kan ångra allt med ett klick.')}</p>
            <div className="l-coach-row">
              <div className="l-coach-stack" role="listbox" aria-label={tr('Välj coach')}>
                {COACHES.map((c) => (
                  <button key={c.id} role="option" aria-selected={c.id === sel.id} className={c.id === sel.id ? 'on' : ''} title={c.name} onClick={() => choose(c.id)}>
                    <CoachAvatar coach={c} size={38} />
                  </button>
                ))}
              </div>
              <span>{tr('Tryck på en coach för att se hur den pratar.')}</span>
            </div>
          </div>
        </div>

        <div className="l-chatwin">
          <div className="l-chathead">
            <CoachAvatar coach={sel} size={32} />
            <div>
              <strong>{sel.name}</strong>
              <span>{tr(sel.tagline)}</span>
            </div>
          </div>
          <div className="l-chat" key={sel.id}>
            <span className="bubble coach">{tr(sel.greeting, { who: tr('du'), name: tr('du') })}</span>
            {['Jag har en skada', 'Jag är sjuk – ändra min plan', 'Jag vill öka antal träningstimmar'].map((q, i) => (
              <span key={q} className="bubble me" style={{ animationDelay: `${0.25 + 0.15 * i}s` }}>
                {tr(q)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <WeekDemo />

      <section className="l-features">
        {FEATURES.map((f) => (
          <div key={f.text} className="l-feat">
            <span className="l-feat-icon">{f.icon}</span>
            <span>{tr(f.text)}</span>
          </div>
        ))}
      </section>

      <footer className="l-footer">
        <div className="l-footer-brand">
          <img className="l-logo small" src="/haugaards_training_logo.png" alt="Haugaards training" draggable={false} />
          <p>{tr('Träningsplanerare för längdskidåkning, byggd för Team Haugaard.')}</p>
        </div>
        <div>
          <h4>{tr('Kontakt')}</h4>
          <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </div>
        <div>
          <h4>{tr('Juridiskt')}</h4>
          <a href="#/privacy">{tr('Integritetspolicy')}</a>
          <a href="#/terms">{tr('Användarvillkor')}</a>
        </div>
        <p className="l-copy">{tr('© {year} {company}. Alla rättigheter förbehållna.', { year: new Date().getFullYear(), company: LEGAL.company })}</p>
      </footer>
    </div>
  )
}
