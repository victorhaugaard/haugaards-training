import { useEffect } from 'react'
import { tr } from '../i18n/core'

interface Props {
  name: string
  onCreate: () => void
  onLookAround: () => void
}

// Välkomstskärm första gången ett konto loggar in
export function Welcome({ name, onCreate, onLookAround }: Props) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === 'Escape' && onLookAround()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onLookAround])

  return (
    <div className="welcome" role="dialog" aria-label={tr('Välkommen, {name}!', { name })}>
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="welcome-card">
        <p className="l-eyebrow">Haugaards · {tr('Säsongen 2026/2027')}</p>
        <h1>{tr('Välkommen, {name}!', { name })}</h1>
        <p className="welcome-lead">
          {tr('Det här är Haugaards träningsplan. Här planerar du träningen fram till loppen, checkar av passen och ser hur du ligger till. Victor har redan en plan, men du behöver en egen.')}
        </p>

        <ol className="welcome-steps">
          <li>
            <span className="ph-n">1</span>
            <div>
              <b>{tr('Lägg till en ny person')}</b>
              <p>{tr('Tryck på + uppe i vänstra hörnet och skriv ditt namn.')}</p>
              <div className="mock-pills" aria-hidden="true">
                <span className="brand">H</span>
                <span className="pill on">Victor</span>
                <span className="pill ghost pulse">+</span>
                <span className="mock-arrow">←</span>
              </div>
            </div>
          </li>
          <li>
            <span className="ph-n">2</span>
            <div>
              <b>{tr('Välj startplan')}</b>
              <p>{tr('Autogenerera en plan efter dina timmar och din vilodag, eller basera den på Victors.')}</p>
            </div>
          </li>
          <li>
            <span className="ph-n">3</span>
            <div>
              <b>{tr('Finjustera med din coach')}</b>
              <p>{tr('Nere till vänster kan du välja coach och be den flytta pass, anpassa planen vid sjukdom eller skada och mycket mer.')}</p>
            </div>
          </li>
        </ol>

        <div className="welcome-actions">
          <button className="btn primary big" onClick={onCreate}>
            {tr('Skapa min plan')}
          </button>
          <button className="btn big" onClick={onLookAround}>
            {tr('Titta runt först')}
          </button>
        </div>
      </div>
    </div>
  )
}
