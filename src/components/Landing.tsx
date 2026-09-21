import { useState } from 'react'
import { daysUntil } from '../lib/dates'
import { RACES } from '../lib/races'
import { Ring } from './Ring'

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

export function Landing({ onEnter, signedIn }: { onEnter: () => void; signedIn: boolean }) {
  const [imgOk, setImgOk] = useState(true)
  return (
    <div className="landing">
      <nav className="l-nav">
        <span className="l-brand">HAUGAARDS</span>
        <div className="l-races" aria-label="Dagar kvar till tävlingarna">
          {RACES.map((r) => (
            <span key={r.id} title={`${r.name} ${r.date}`}>
              <em>{r.short}</em>
              <b>{Math.max(0, daysUntil(r.date))}</b> d
            </span>
          ))}
        </div>
        <button className="l-link" onClick={onEnter}>
          {signedIn ? 'Öppna planen' : 'Logga in'}
        </button>
      </nav>

      <header className="l-hero">
        <div className="l-copy">
          <p className="l-eyebrow">Säsongen 2026/2027</p>
          <h1>
            Välkommen till
            <br />
            Haugaards träningsplan
          </h1>
          <p className="l-lead">
            En enkel planerare för längdskidåkning, byggd för två. Följ ett upplägg på skidelitens modell, flytta passen så
            det passar veckan, checka av och se hur timmar och intensitet faller ut. Från Gsiesertal och Vasaloppet till Birkebeinerrennet och Nordenskiöldsloppet.
          </p>
          <button className="l-cta" onClick={onEnter}>
            Öppna planen <span>→</span>
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
              <div className="l-big">{p.big}</div>
              <div className="l-label">{p.label}</div>
              <p>{p.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="l-features">
        {FEATURES.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </section>
    </div>
  )
}
