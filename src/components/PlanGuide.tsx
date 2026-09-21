import { useMemo } from 'react'
import type { RunMode, Session } from '../types'
import { CYCLE, PHASES } from '../lib/generator'
import { addDays, cap, startOfWeek, weekdayLong } from '../lib/dates'
import { fmtHours } from '../lib/stats'
import { getLang, tr } from '../i18n/core'
import { rich } from '../i18n'

const GROUPS: [string, (s: Session) => boolean][] = [
  ['Cykel', (s) => s.sport === 'Cykel'],
  ['Rullskidor', (s) => s.sport === 'Rullskidor'],
  ['Stakmaskin', (s) => s.sport === 'Stakmaskin'],
  ['Skidor', (s) => s.sport === 'Skidor'],
  ['Löpning', (s) => s.sport === 'Löpning'],
  ['Styrka & rörlighet', (s) => s.sport === 'Styrka' || s.sport === 'Rörlighet'],
]

const dec = (n: number) => n.toFixed(1).replace('.', getLang() === 'en' ? '.' : ',')
const mins = (s: Session) => s.zones.reduce((a, b) => a + b, 0) + s.nonZone

export function PlanGuide({ sessions: all, runMode, restDay = 0 }: { sessions: Session[]; runMode: RunMode; restDay?: number }) {
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
      <p>{rich(tr('Säsongens mål är **Gsieser Tal Lauf** (20 feb), **Vasaloppet** (7 mars), **Birkebeinerrennet** och **Nordenskiöldsloppet** (båda 20 mars, så du behöver välja ett av dem). Planen går hela vägen till 20 mars och bygger på hur längdskidelitens höst ser ut: mycket lugn träning som grund, få men välplanerade hårda pass, en riktig vilodag varje vecka och en lättare vecka var fjärde. Uthållighet, långpass och matintag prioriteras, eftersom loppen avgörs av hållbarhet mer än fart.'))}</p>

      <div className="tiles">
        <div>
          <b>{fmtHours(st.perWeek)}</b>
          <span>{tr('i snitt per vecka')}</span>
        </div>
        <div>
          <b>{st.lowPct}%</b>
          <span>{tr('av zontiden är lugn')}</span>
        </div>
        <div>
          <b>{dec(st.sessionsPerWeek)}</b>
          <span>{tr('pass per vecka')}</span>
        </div>
        <div>
          <b>{dec(st.qualityPerWeek)}</b>
          <span>{tr('hårda pass per vecka')}</span>
        </div>
      </div>

      <h4>{tr('Vad du tränar')}</h4>
      <div className="sportbars">
        {st.bySport.map((g) => (
          <div key={g.label}>
            <span>{tr(g.label)}</span>
            <div className="sb-track">
              <i style={{ width: `${(g.perWeek / st.maxSport) * 100}%` }} />
            </div>
            <b>{fmtHours(g.perWeek)}</b>
          </div>
        ))}
      </div>
      <p className="muted small">
        {tr(
          runMode === 'none'
            ? 'Ingen löpning. Allt löpande ersätts av cykel, rullskidor och stakmaskin för att skona knäna.'
            : 'Ett lugnt löppass per vecka som omväxling. Resten är cykel, rullskidor och stakmaskin.',
        )}{' '}
        {tr('Stakmaskinen (Ercolina, på rullskidor) tar plats i veckorna som teknik, distans, intervaller och kraft. Zwift/Tacx används för tröskel och VO₂max inomhus.')}
      </p>

      <h4>{tr('Faserna')}</h4>
      <ol className="phases">
        {PHASES.map((p, i) => (
          <li key={p.id}>
            <span className="ph-n">{i + 1}</span>
            <div>
              <strong>{tr(p.label)}</strong> <em>{tr(p.span)}</em>
              <p>{tr(p.text)}</p>
            </div>
          </li>
        ))}
      </ol>

      <h4>{tr('Veckans rytm')}</h4>
      {restDay === 0 ? (
      <ul className="rhythm">
          <li>
            <b>{tr('Mån')}</b> {tr('Vilodag. Kroppen bygger upp det du tränade i helgen.')}
          </li>
          <li>
            <b>{tr('Tis och lör')}</b> {tr('Kvalitet: tröskel, VO₂ eller stakmaskin. Kroppen ska vara utvilad.')}
          </li>
          <li>
            <b>{tr('Tor')}</b> {tr('Lättare kvalitet, tempo eller fartlek, och styrka för överkroppen. Släpps i vilovecka.')}
          </li>
          <li>
            <b>{tr('Sön')}</b> {tr('Långpass, växelvis rullskidor och cykel.')}
          </li>
          <li>
            <b>{tr('Ons och fre')}</b> {tr('Lugn bas, styrka (gym eller hemma) och rörlighet.')}
          </li>
        </ul>
      ) : (
        <p className="muted small">
          {restDay > 0
            ? tr('Vilodagen ligger på {dag}. Passen som annars ligger där har flyttats till måndagen.', { dag: cap(weekdayLong(addDays('2026-09-21', restDay))) })
            : tr('Ingen fast vilodag. Lägg in vila själv där kroppen behöver det.')}
        </p>
      )}

      <h4>{tr('Före och efter tävling')}</h4>
      <ul className="rhythm">
        <li>
          <b>{tr('6 dagar innan')}</b> {tr('Lugna pass och två korta skärpepass, styrkan pausas.')}
        </li>
        <li>
          <b>{tr('Dagen innan')}</b> {tr('Vila. Sov, ät kolhydrater och förbered utrustningen.')}
        </li>
        <li>
          <b>{tr('Efter loppet')}</b> {tr('En vilodag och därefter lugn träning. Efter de långa loppen två vilodagar.')}
        </li>
      </ul>

      <h4>{tr('Belastning över fyra veckor')}</h4>
      <div className="cycle">
        {CYCLE.map((c, i) => (
          <div key={i}>
            <div className="cy-bar">
              <i style={{ height: `${(c / 1.14) * 100}%` }} className={i === 3 ? 'rest' : ''} />
            </div>
            <span>{i === 3 ? tr('Vila') : tr('Vecka {n}', { n: i + 1 })}</span>
            <b>{Math.round(c * 100)}%</b>
          </div>
        ))}
      </div>
      <p className="muted small">{tr('Tre veckor med ökande volym och sedan en lättare vecka. Då tar kroppen upp träningseffekten.')}</p>
    </div>
  )
}
