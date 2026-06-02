export interface Usuario {
  id: string
  username: string
  email: string
  role: string
}

export interface LoginResponse {
  token: string
  username: string
  email: string
  role: string
  expiresAt: string
}

export interface Producto {
  id: string
  name: string
  description: string
  category: string
  sku: string
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  lots: Lote[]
}

export interface Lote {
  id: string
  productId: string
  lotNumber: string
  price: number
  entryDate: string
  quantity: number
  notes?: string
}

export interface PaginatedResult<T> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface FiltrosProducto {
  name?: string
  category?: string
  sku?: string
  page?: number
  pageSize?: number
}
