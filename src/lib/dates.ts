import { locale } from '../i18n/core'

export const iso = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12)
}

export const addDays = (s: string, n: number) => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}

export const addMonths = (s: string, n: number) => {
  const d = parse(s)
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  return iso(d)
}

export const today = () => iso(new Date())

// måndag = 0
export const weekdayIndex = (s: string) => (parse(s).getDay() + 6) % 7

export const startOfWeek = (s: string) => addDays(s, -weekdayIndex(s))

export const weekDays = (s: string) => {
  const start = startOfWeek(s)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const monthGrid = (s: string) => {
  const d = parse(s)
  const first = iso(new Date(d.getFullYear(), d.getMonth(), 1, 12))
  const start = startOfWeek(first)
  const last = iso(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12))
  const end = addDays(startOfWeek(last), 6)
  const days: string[] = []
  for (let cur = start; cur <= end; cur = addDays(cur, 1)) days.push(cur)
  return days
}

export const weekNumber = (s: string) => {
  const d = parse(s)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4, 12)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale(), o)
export const weekdayLong = (s: string) => fmt({ weekday: 'long' }).format(parse(s))
export const weekdayShort = (s: string) => fmt({ weekday: 'short' }).format(parse(s))
export const dayMonth = (s: string) => fmt({ day: 'numeric', month: 'short' }).format(parse(s))
export const monthYear = (s: string) => fmt({ month: 'long', year: 'numeric' }).format(parse(s))
export const fullDate = (s: string) => fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(parse(s))
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const daysUntil = (s: string) => Math.round((parse(s).getTime() - parse(today()).getTime()) / 86400000)
