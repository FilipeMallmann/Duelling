interface Props {
  small?: boolean
}

export default function CardBack({ small }: Props) {
  return (
    <div
      className={[
        'rounded border-2 border-noble-gold/40 bg-gradient-to-br from-blue-900 to-blue-950 select-none',
        small ? 'w-12 h-16' : 'w-16 h-24',
      ].join(' ')}
      aria-label="Face-down card"
    >
      <div className="w-full h-full rounded border border-blue-700/40 flex items-center justify-center">
        <span className="text-noble-gold/60 text-xs">⚔</span>
      </div>
    </div>
  )
}
