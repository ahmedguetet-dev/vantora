import { create } from 'zustand'

interface CartUiState {
  open: boolean
  openCart: () => void
  closeCart: () => void
}

export const useCartUiStore = create<CartUiState>((set) => ({
  open: false,
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
}))