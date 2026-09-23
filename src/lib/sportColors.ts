import type { Sport } from '../types'

// Fast kategorisk ordning och färg per idrott (aldrig omordnad efter vad som råkar finnas med).
// Validerad mot appens mörka bakgrund (kontrast, CVD-avstånd) med dataviz-skillets script.
export const SPORT_ORDER: Sport[] = ['Cykel', 'Stakmaskin', 'Rullskidor', 'Löpning', 'Rörlighet', 'Styrka', 'Skidor', 'Tävling', 'Övrigt']

export const SPORT_COLOR: Partial<Record<Sport, string>> = {
  Cykel: 'var(--sport-cykel)',
  Stakmaskin: 'var(--sport-stakmaskin)',
  Rullskidor: 'var(--sport-rullskidor)',
  Löpning: 'var(--sport-lopning)',
  Rörlighet: 'var(--sport-rorlighet)',
  Styrka: 'var(--sport-styrka)',
  Skidor: 'var(--sport-skidor)',
  Tävling: 'var(--sport-tavling)',
  Övrigt: 'var(--sport-ovrigt)',
}

export const sportColor = (s: Sport) => SPORT_COLOR[s] ?? 'var(--sport-ovrigt)'
