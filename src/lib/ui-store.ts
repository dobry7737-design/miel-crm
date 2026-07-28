'use client'

import { create } from 'zustand'

interface UIState {
  primaryAction: (() => void) | null
  setPrimaryAction: (fn: (() => void) | null) => void
  openPrimaryAction: () => void
}

export const useUI = create<UIState>((set, get) => ({
  primaryAction: null,
  setPrimaryAction: (fn) => set({ primaryAction: fn }),
  openPrimaryAction: () => {
    const fn = get().primaryAction
    if (fn) fn()
  },
}))
