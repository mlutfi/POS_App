import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: string
  name: string
  email: string
  role: string
  mustChangePassword: boolean
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Product {
  id: string
  categoryId?: string
  category?: string
  sku?: string
  barcode?: string
  name: string
  price: number
  cost?: number
  imageUrl?: string
  isActive: boolean
  qtyOnHand: number
}

export interface Category {
  id: string
  name: string
}

export interface SaleItem {
  id: string
  productId: string
  productName: string
  qty: number
  price: number
  subtotal: number
}

export interface Sale {
  id: string
  cashierId: string
  cashierName: string
  customerName?: string
  status: string
  total: number
  items: SaleItem[]
  createdAt: string
}

export interface ReportFilter {
  startDate?: string
  endDate?: string
  cashierId?: string
  paymentMethod?: string
}

export interface ReportSummary {
  totalRevenue: number
  totalTransactions: number
  totalItems: number
  averageOrder: number
  cashRevenue: number
  cashTransactions: number
  qrisRevenue: number
  qrisTransactions: number
}

export interface DailyChartPoint {
  date: string
  revenue: number
  transactions: number
}

export interface SaleItemDetail {
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface SaleDetail {
  id: string
  cashierName: string
  customerName?: string
  total: number
  paymentMethod: string
  itemCount: number
  items: SaleItemDetail[]
  createdAt: string
}

export interface CashierOption {
  id: string
  name: string
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password })
    console.log('Login response:', response.data);
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me')
    return response.data.data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword })
  },
}

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products')
    return response.data.data ?? []
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`)
    return response.data.data
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`)
    return response.data.data ?? []
  },

  getByCategory: async (categoryId: string): Promise<Product[]> => {
    const response = await api.get(`/products/by-category?categoryId=${categoryId}`)
    return response.data.data ?? []
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', data)
    return response.data.data
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data.imageUrl
  },
}

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories')
    return response.data.data ?? []
  },

  create: async (name: string): Promise<Category> => {
    const response = await api.post('/categories', { name })
    return response.data.data
  },

  update: async (id: string, name: string): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, { name })
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },
}

// Sales API
export const salesApi = {
  create: async (items: { productId: string; qty: number }[], customerName?: string): Promise<Sale> => {
    const response = await api.post('/sales', { items, customerName })
    return response.data.data
  },

  getById: async (id: string): Promise<Sale> => {
    const response = await api.get(`/sales/${id}`)
    return response.data.data
  },

  payCash: async (id: string, amount: number): Promise<void> => {
    await api.post(`/sales/${id}/pay-cash`, { amount })
  },

  payQRIS: async (id: string): Promise<{ qrisUrl: string }> => {
    const response = await api.post(`/sales/${id}/pay-qris`)
    return response.data.data
  },

  getDailyReport: async (date?: string): Promise<{
    date: string
    totalSales: number
    totalRevenue: number
    totalItems: number
    cashSales: number
    qrisSales: number
  }> => {
    const response = await api.get(`/sales/daily-report${date ? `?date=${date}` : ''}`)
    return response.data.data
  },
}

// Reports API
export const reportsApi = {
  getSummary: async (filter?: ReportFilter): Promise<ReportSummary> => {
    const params = new URLSearchParams()
    if (filter?.startDate) params.append('startDate', filter.startDate)
    if (filter?.endDate) params.append('endDate', filter.endDate)
    if (filter?.cashierId) params.append('cashierId', filter.cashierId)
    if (filter?.paymentMethod) params.append('paymentMethod', filter.paymentMethod)

    const response = await api.get(`/reports/summary?${params.toString()}`)
    return response.data.data
  },

  getChart: async (filter?: ReportFilter): Promise<DailyChartPoint[]> => {
    const params = new URLSearchParams()
    if (filter?.startDate) params.append('startDate', filter.startDate)
    if (filter?.endDate) params.append('endDate', filter.endDate)
    if (filter?.cashierId) params.append('cashierId', filter.cashierId)
    if (filter?.paymentMethod) params.append('paymentMethod', filter.paymentMethod)

    const response = await api.get(`/reports/chart?${params.toString()}`)
    return response.data.data ?? []
  },

  getSales: async (filter?: ReportFilter): Promise<SaleDetail[]> => {
    const params = new URLSearchParams()
    if (filter?.startDate) params.append('startDate', filter.startDate)
    if (filter?.endDate) params.append('endDate', filter.endDate)
    if (filter?.cashierId) params.append('cashierId', filter.cashierId)
    if (filter?.paymentMethod) params.append('paymentMethod', filter.paymentMethod)

    const response = await api.get(`/reports/sales?${params.toString()}`)
    return response.data.data ?? []
  },

  exportExcel: async (filter?: ReportFilter): Promise<Blob> => {
    const params = new URLSearchParams()
    if (filter?.startDate) params.append('startDate', filter.startDate)
    if (filter?.endDate) params.append('endDate', filter.endDate)
    if (filter?.cashierId) params.append('cashierId', filter.cashierId)
    if (filter?.paymentMethod) params.append('paymentMethod', filter.paymentMethod)

    const response = await api.get(`/reports/export?${params.toString()}`, {
      responseType: 'blob'
    })
    return response.data
  },

  getCashiers: async (): Promise<CashierOption[]> => {
    const response = await api.get('/reports/cashiers')
    return response.data.data ?? []
  },
}