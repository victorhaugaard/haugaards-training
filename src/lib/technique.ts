import type { Session, Sport, Technique } from '../types'
import { tr } from '../i18n/core'

// Rullskidor och längdskidor går att köra klassiskt, i fristil, eller rent stakning.
// Skilt från Stakmaskin (Ercolina), som är ett eget redskap, inte en teknik på skidor/rullskidor.
export const TECHNIQUE_SPORTS: Sport[] = ['Rullskidor', 'Skidor']
export const hasTechnique = (sport: Sport) => TECHNIQUE_SPORTS.includes(sport)

// Svenska nycklar (källtext) per teknik. Översätts med tr() vid varje användning,
// inte i förväg, så att de följer med när språket byts.
const LABEL_KEY: Record<Technique, string> = { classic: 'Klassiskt', skate: 'Fristil', pole: 'Stakning' }
export const techniqueLabel = (t: Technique) => tr(LABEL_KEY[t])

// Rader att bygga en Segmented-väljare av. Anropas i render, inte sparad som konstant,
// så att texten uppdateras direkt om språket byts.
export const techniqueOptions = (): [Technique | '', string][] => [
  ['', tr('Valfri teknik')],
  ['classic', techniqueLabel('classic')],
  ['skate', techniqueLabel('skate')],
  ['pole', techniqueLabel('pole')],
]

// Kort suffix för meta-rader, t.ex. " · Klassiskt". Tomt om ingen teknik är satt.
export const techniqueSuffix = (s: Pick<Session, 'sport' | 'technique'>) => (s.technique ? ` · ${techniqueLabel(s.technique)}` : '')
