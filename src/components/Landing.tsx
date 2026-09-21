import { useState } from 'react'
import { daysUntil } from '../lib/dates'
import { RACES } from '../lib/races'
import { Ring } from './Ring'
import { tr, LANGS, getLang } from '../i18n/core'
import { useLang } from '../i18n'
import { CoachAvatar } from './CoachAvatar'
import { COACHES, coachById, readCoach } from '../lib/coaches'

const PILLARS = [
  { value: 0.8, big: '10–15 h', label: 'Träning per vecka', text: 'Skalad från elitens upplägg till en vecka som går att leva med.' },
  { value: 0.75, big: '3 + 1', label: 'Belastningscykel', text: 'Tre veckor som bygger upp, en som låter kroppen ta emot.' },
  { value: 0.9, big: '≈ 90 %', label: 'Lugn träning', text: 'Mycket grund, få hårda pass. Så tränar längdskidåkarna i världseliten.' },
]

const FEATURES = [
  'Coachens beskrivning till varje pass',
  'Ercolina, Zwift och Tacx som en del av planen',
  'Gym eller hemma med lätta redskap',
  'Skonsamt för knäna, mest cykel och rullskidor',
]

export function Landing({ onEnter }: { onEnter: () => void }) {
  const { setLang } = useLang()
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
        <span className="l-brand">HAUGAARDS</span>
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
            {tr('En enkel planerare för längdskidåkning, byggd för två. Följ ett upplägg på skidelitens modell, flytta passen så det passar veckan, checka av och se hur timmar och intensitet faller ut. Från Gsieser Tal Lauf och Vasaloppet till Birkebeinerrennet och Nordenskiöldsloppet.')}
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
        <CoachAvatar coach={coachById(readCoach())} size={84} />
        <div>
          <div className="l-label">{tr('Dina coacher')}</div>
          <h2>{tr('Din tränare finns alltid till hands')}</h2>
          <p>{tr('Blir du sjuk, skadar dig eller får ont om tid? Fråga din coach. Coachen flyttar och skjuter upp pass, lägger in rehab, sänker eller ökar mängden och bygger om planen åt dig. Du ser vad som ändrats och kan ångra allt med ett klick.')}</p>
          <div className="l-coach-row">
            <div className="l-coach-stack">
              {COACHES.map((c) => (
                <CoachAvatar key={c.id} coach={c} size={34} />
              ))}
            </div>
            <span>{tr('Välj mellan tio coacher, från Smirnov till Farmor & Farfar.')}</span>
          </div>
          <div className="l-coach-chips">
            {['Jag har en skada', 'Jag är sjuk – ändra min plan', 'Jag vill öka antal träningstimmar'].map((q) => (
              <span key={q}>{tr(q)}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="l-features">
        {FEATURES.map((f) => (
          <span key={f}>{tr(f)}</span>
        ))}
      </section>
    </div>
  )
}
