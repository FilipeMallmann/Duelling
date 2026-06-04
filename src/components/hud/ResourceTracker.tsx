interface Props {
  resources: number
  label?: string
}

export default function ResourceTracker({ resources, label }: Props) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-400">{label}</span>}
      <div className="flex items-center gap-1 bg-gray-800 rounded-full px-3 py-1">
        <span className="text-yellow-400 text-sm">◆</span>
        <span className="text-white font-bold text-sm">{resources}</span>
      </div>
    </div>
  )
}
