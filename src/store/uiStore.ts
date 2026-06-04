import { create } from 'zustand'

interface UIStore {
  selectedNobleId: string | null
  selectedCardIds: string[]
  peekingHand: boolean
  setSelectedNoble: (id: string | null) => void
  toggleSelectedCard: (id: string) => void
  setSelectedCards: (ids: string[]) => void
  setPeekingHand: (value: boolean) => void
  clearSelections: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  selectedNobleId: null,
  selectedCardIds: [],
  peekingHand: false,

  setSelectedNoble: (id) => set({ selectedNobleId: id }),

  toggleSelectedCard: (id) =>
    set((state) => ({
      selectedCardIds: state.selectedCardIds.includes(id)
        ? state.selectedCardIds.filter((c) => c !== id)
        : [...state.selectedCardIds, id],
    })),

  setSelectedCards: (ids) => set({ selectedCardIds: ids }),

  setPeekingHand: (value) => set({ peekingHand: value }),

  clearSelections: () => set({ selectedNobleId: null, selectedCardIds: [] }),
}))
