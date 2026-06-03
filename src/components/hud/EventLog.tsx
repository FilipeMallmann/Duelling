import { useEffect, useRef } from 'react'

interface Props {
  log: string[]
}

export default function EventLog({ log }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  return (
    <div className="flex flex-col h-full">
      <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 px-2">Event Log</span>
      <div className="overflow-y-auto flex-1 px-2 py-1 space-y-0.5" style={{ maxHeight: '8rem' }}>
        {log.map((entry, i) => (
          <div key={i} className="text-xs text-gray-400 leading-snug">
            {entry}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
