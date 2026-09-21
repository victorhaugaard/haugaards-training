import { useTween } from '../lib/useTween'

export function Num({ value, format }: { value: number; format: (n: number) => string }) {
  return <>{format(useTween(value))}</>
}
