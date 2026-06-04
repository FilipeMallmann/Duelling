interface Props {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  small?: boolean
}

const variants = {
  primary: 'bg-[var(--color-noble-gold)] text-gray-900 hover:brightness-110',
  secondary: 'bg-gray-700 text-white hover:bg-gray-600',
  danger: 'bg-red-700 text-white hover:bg-red-600',
}

export default function ActionButton({ label, onClick, disabled, variant = 'secondary', small }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'rounded font-semibold transition-all',
        small ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm',
        disabled ? 'opacity-40 cursor-not-allowed bg-gray-700 text-gray-400' : variants[variant],
      ].join(' ')}
    >
      {label}
    </button>
  )
}
