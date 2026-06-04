import type { Noble } from '@/types'
import { isEliminated } from '@/engine/nobles'
import NobleCard from './NobleCard'

interface Props {
  nobles: Noble[]
  selectableIds?: string[]
  selectedId?: string | null
  targetedId?: string | null
  onNobleClick?: (noble: Noble) => void
  label?: string
}

export default function Courtyard({ nobles, selectableIds, selectedId, targetedId, onNobleClick, label }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>}
      <div className="flex gap-3 flex-wrap">
        {nobles.map((noble) => (
          <NobleCard
            key={noble.id}
            noble={noble}
            variant="courtyard"
            eliminated={isEliminated(noble)}
            selectable={selectableIds?.includes(noble.id) && !isEliminated(noble)}
            selected={selectedId === noble.id}
            targeted={targetedId === noble.id}
            onClick={onNobleClick && !isEliminated(noble) ? () => onNobleClick(noble) : undefined}
          />
        ))}
        {nobles.length === 0 && (
          <div className="w-24 h-28 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
            <span className="text-gray-600 text-xs">Empty</span>
          </div>
        )}
      </div>
    </div>
  )
}
