interface Props<T extends string> {
  value: T
  options: [T, string][]
  onChange: (v: T) => void
}

export function Segmented<T extends string>({ value, options, onChange }: Props<T>) {
  const i = Math.max(0, options.findIndex(([v]) => v === value))
  return (
    <div className="seg" style={{ '--n': options.length, '--i': i } as React.CSSProperties}>
      <span className="seg-thumb" />
      {options.map(([v, l]) => (
        <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  )
}
