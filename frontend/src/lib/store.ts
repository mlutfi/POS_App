import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from './api'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token })
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
        }
      },
      logout: () => {
        set({ user: null, token: null })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      },
      isAuthenticated: () => {
        const state = get()
        return !!state.token && !!state.user
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface CartItem {
  productId: string
  name: string
  price: number
  qty: number
}

interface CartState {
  items: CartItem[]
  customerName: string
  addItem: (item: CartItem) => void
  updateQty: (productId: string, qty: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setCustomerName: (name: string) => void
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerName: '',
  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, qty: i.qty + item.qty }
              : i
          ),
        }
      }
      return { items: [...state.items, item] }
    })
  },
  updateQty: (productId, qty) => {
    set((state) => ({
      items: state.items
        .map((i) => (i.productId === productId ? { ...i, qty } : i))
        .filter((i) => i.qty > 0),
    }))
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }))
  },
  clearCart: () => {
    set({ items: [], customerName: '' })
  },
  setCustomerName: (name) => {
    set({ customerName: name })
  },
  getTotal: () => {
    const state = get()
    return state.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  },
}))