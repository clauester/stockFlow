import axiosClient from '../../api/axiosClient'
import type { Producto, Lote, PaginatedResult, FiltrosProducto } from '../../types'

export async function getProductos(filtros: FiltrosProducto = {}): Promise<PaginatedResult<Producto>> {
  const { data } = await axiosClient.get<PaginatedResult<Producto>>('/products', { params: filtros })
  return data
}

export async function getProducto(id: string): Promise<Producto> {
  const { data } = await axiosClient.get<Producto>(`/products/${id}`)
  return data
}

export async function crearProducto(payload: Omit<Producto, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'lots'>): Promise<Producto> {
  const { data } = await axiosClient.post<Producto>('/products', payload)
  return data
}

export async function actualizarProducto(id: string, payload: Partial<Producto>): Promise<Producto> {
  const { data } = await axiosClient.put<Producto>(`/products/${id}`, payload)
  return data
}

export async function eliminarProducto(id: string): Promise<void> {
  await axiosClient.delete(`/products/${id}`)
}

export async function getLotes(productId: string): Promise<Lote[]> {
  const { data } = await axiosClient.get<Lote[]>(`/products/${productId}/lots`)
  return data
}

export async function crearLote(productId: string, payload: Omit<Lote, 'id' | 'productId'>): Promise<Lote> {
  const { data } = await axiosClient.post<Lote>(`/products/${productId}/lots`, payload)
  return data
}

export async function actualizarLote(productId: string, lotId: string, payload: Partial<Lote>): Promise<Lote> {
  const { data } = await axiosClient.put<Lote>(`/products/${productId}/lots/${lotId}`, payload)
  return data
}

export async function eliminarLote(productId: string, lotId: string): Promise<void> {
  await axiosClient.delete(`/products/${productId}/lots/${lotId}`)
}
