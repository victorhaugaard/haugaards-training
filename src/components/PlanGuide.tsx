import { useMemo } from 'react'
import type { RunMode, Session } from '../types'
import { CYCLE, PHASES } from '../lib/generator'
import { startOfWeek } from '../lib/dates'
import { fmtHours } from '../lib/stats'

const GROUPS: [string, (s: Session) => boolean][] = [
  ['Cykel', (s) => s.sport === 'Cykel'],
  ['Rullskidor', (s) => s.sport === 'Rullskidor'],
  ['Stakmaskin', (s) => s.sport === 'Stakmaskin'],
  ['Skidor', (s) => s.sport === 'Skidor'],
  ['Löpning', (s) => s.sport === 'Löpning'],
  ['Styrka & rörlighet', (s) => s.sport === 'Styrka' || s.sport === 'Rörlighet'],
]

const mins = (s: Session) => s.zones.reduce((a, b) => a + b, 0) + s.nonZone

export function PlanGuide({ sessions: all, runMode }: { sessions: Session[]; runMode: RunMode }) {
  const sessions = useMemo(() => all.filter((s) => s.category !== 'race' && s.category !== 'rest'), [all])
  const st = useMemo(() => {
    const weeks = Math.max(1, new Set(sessions.map((s) => startOfWeek(s.date))).size)
    const total = sessions.reduce((a, s) => a + mins(s), 0)
    const zones = sessions.reduce((a, s) => a + s.zones.reduce((x, y) => x + y, 0), 0)
    const low = sessions.reduce((a, s) => a + s.zones[0] + s.zones[1], 0)
    const quality = sessions.filter((s) => s.category === 'quality' || s.category === 'hard').length
    const bySport = GROUPS.map(([label, f]) => ({
      label,
      perWeek: sessions.filter(f).reduce((a, s) => a + mins(s), 0) / weeks,
    })).filter((g) => g.perWeek > 0)
    return {
      perWeek: total / weeks,
      lowPct: zones ? Math.round((low / zones) * 100) : 0,
      sessionsPerWeek: sessions.length / weeks,
      qualityPerWeek: quality / weeks,
      bySport,
      maxSport: Math.max(1, ...bySport.map((g) => g.perWeek)),
    }
  }, [sessions])

  return (
    <div className="guide">
      <p>
        Säsongens mål är <b>Gsieser Tal Lauf</b> (20 feb), <b>Vasaloppet</b> (7 mars), <b>Birkebeinerrennet</b> och{' '}
        <b>Nordenskiöldsloppet</b> (båda 20 mars, så du behöver välja ett av dem). Planen går hela vägen till 20 mars och
        bygger på hur längdskidelitens höst ser ut: mycket lugn träning som grund, få men välplanerade hårda pass, en riktig
        vilodag varje vecka och en lättare vecka var fjärde. Uthållighet, långpass och matintag prioriteras, eftersom loppen
        avgörs av hållbarhet mer än fart.
      </p>

      <div className="tiles">
        <div>
          <b>{fmtHours(st.perWeek)}</b>
          <span>i snitt per vecka</span>
        </div>
        <div>
          <b>{st.lowPct}%</b>
          <span>av zontiden är lugn</span>
        </div>
        <div>
          <b>{st.sessionsPerWeek.toFixed(1).replace('.', ',')}</b>
          <span>pass per vecka</span>
        </div>
        <div>
          <b>{st.qualityPerWeek.toFixed(1).replace('.', ',')}</b>
          <span>hårda pass per vecka</span>
        </div>
      </div>

      <h4>Vad du tränar</h4>
      <div className="sportbars">
        {st.bySport.map((g) => (
          <div key={g.label}>
            <span>{g.label}</span>
            <div className="sb-track">
              <i style={{ width: `${(g.perWeek / st.maxSport) * 100}%` }} />
            </div>
            <b>{fmtHours(g.perWeek)}</b>
          </div>
        ))}
      </div>
      <p className="muted small">
        {runMode === 'none'
          ? 'Ingen löpning. Allt löpande ersätts av cykel, rullskidor och stakmaskin för att skona knäna.'
          : 'Ett lugnt löppass per vecka som omväxling. Resten är cykel, rullskidor och stakmaskin.'}{' '}
        Stakmaskinen (Ercolina, på rullskidor) tar plats i veckorna som teknik, distans, intervaller och kraft. Zwift/Tacx används för
        tröskel och VO₂max inomhus.
      </p>

      <h4>Faserna</h4>
      <ol className="phases">
        {PHASES.map((p, i) => (
          <li key={p.id}>
            <span className="ph-n">{i + 1}</span>
            <div>
              <strong>{p.label}</strong> <em>{p.span}</em>
              <p>{p.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h4>Veckans rytm</h4>
      <ul className="rhythm">
        <li>
          <b>Mån</b> Vilodag. Kroppen bygger upp det du tränade i helgen.
        </li>
        <li>
          <b>Tis och lör</b> Kvalitet: tröskel, VO₂ eller stakmaskin. Kroppen ska vara utvilad.
        </li>
        <li>
          <b>Tor</b> Lättare kvalitet, tempo eller fartlek, och styrka för överkroppen. Släpps i vilovecka.
        </li>
        <li>
          <b>Sön</b> Långpass, växelvis rullskidor och cykel.
        </li>
        <li>
          <b>Ons och fre</b> Lugn bas, styrka (gym eller hemma) och rörlighet.
        </li>
      </ul>

      <h4>Före och efter tävling</h4>
      <ul className="rhythm">
        <li>
          <b>6 dagar innan</b> Lugna pass och två korta skärpepass, styrkan pausas.
        </li>
        <li>
          <b>Dagen innan</b> Vila. Sov, ät kolhydrater och förbered utrustningen.
        </li>
        <li>
          <b>Efter loppet</b> En vilodag och därefter lugn träning. Efter de långa loppen två vilodagar.
        </li>
      </ul>

      <h4>Belastning över fyra veckor</h4>
      <div className="cycle">
        {CYCLE.map((c, i) => (
          <div key={i}>
            <div className="cy-bar">
              <i style={{ height: `${(c / 1.14) * 100}%` }} className={i === 3 ? 'rest' : ''} />
            </div>
            <span>{i === 3 ? 'Vila' : `Vecka ${i + 1}`}</span>
            <b>{Math.round(c * 100)}%</b>
          </div>
        ))}
      </div>
      <p className="muted small">Tre veckor med ökande volym och sedan en lättare vecka. Då tar kroppen upp träningseffekten.</p>
    </div>
  )
}
