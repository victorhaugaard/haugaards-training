import { LANGS, getLang, tr } from '../i18n/core'
import { useLang } from '../i18n'
import { LEGAL, legalDoc } from '../lib/legal'

// Integritetspolicy och användarvillkor
export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { setLang } = useLang()
  const lang = getLang()
  const doc = legalDoc(kind, lang)
  const back = () => (window.history.length > 1 ? window.history.back() : (location.hash = '#/'))
  return (
    <div className="landing legal-page">
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <nav className="l-nav">
        <a href="#/" className="l-logo-link">
          <img className="l-logo" src="/haugaards_training_logo.png" alt="Haugaards training" draggable={false} />
        </a>
        <div className="l-lang" aria-label={tr('Språk')}>
          {LANGS.map(([code, label]) => (
            <button key={code} className={code === lang ? 'on' : ''} onClick={() => setLang(code)} title={label}>
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <article className="legal-card">
        <button className="l-link" onClick={back}>
          ‹ {tr('Tillbaka')}
        </button>
        <h1>{doc.title}</h1>
        <p className="legal-meta">
          {tr('Senast uppdaterad {date}', { date: LEGAL.updated })}
          {lang === 'no' && ' · ' + tr('Den här sidan finns på svenska och engelska.')}
        </p>
        <p className="legal-intro">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </section>
        ))}
        <p className="legal-meta">
          {LEGAL.company}
          {LEGAL.orgNumber ? ` · ${LEGAL.orgNumber}` : ''}
          {LEGAL.address ? ` · ${LEGAL.address}` : ''} · <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </p>
      </article>
    </div>
  )
}
