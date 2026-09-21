import { useState } from 'react'
import { daysUntil } from '../lib/dates'
import { RACE } from '../lib/generator'
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
        <span className="l-count">
          <b>{daysUntil(RACE.date)}</b> dagar kvar
        </span>
        <button className="l-link" onClick={onEnter}>
          {signedIn ? 'Öppna planen' : 'Logga in'}
        </button>
      </nav>

      <header className="l-hero">
        <div className="l-copy">
          <p className="l-eyebrow">Mål · {RACE.name} 20 mars 2027</p>
          <h1>
            Välkommen till
            <br />
            Haugaards träningsplan
          </h1>
          <p className="l-lead">
            En enkel planerare för längdskidåkning, byggd för två. Följ ett upplägg på skidelitens modell, flytta passen så
            det passar veckan, checka av och se hur timmar och intensitet faller ut. Hela vägen mot 220 km i Jokkmokk.
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
              <Ring value={0.9} size={220} stroke={10} color="#00f19f" />
              <Ring value={0.65} size={160} stroke={10} color="#4cc9f0" />
              <Ring value={0.4} size={100} stroke={10} color="#ff5e57" />
            </div>
          )}
        </div>
      </header>

      <section className="l-pillars">
        {PILLARS.map((p) => (
          <article key={p.big}>
            <Ring value={p.value} size={52} stroke={4} color="#00f19f" />
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
