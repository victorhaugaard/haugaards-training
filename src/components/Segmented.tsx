interface Props<T extends string> {
  value: T
  options: [T, string][]
  onChange: (v: T) => void
}

export function Segmented<T extends string>({ value, options, onChange }: Props<T>) {
  const found = options.findIndex(([v]) => v === value)
  const i = Math.max(0, found)
  return (
    <div className="seg" style={{ '--n': options.length, '--i': i } as React.CSSProperties}>
      <span className="seg-thumb" style={{ opacity: found < 0 ? 0 : 1 }} />
      {options.map(([v, l]) => (
        <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  )
}
