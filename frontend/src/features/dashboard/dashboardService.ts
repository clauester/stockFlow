import axiosClient from '../../api/axiosClient'

export interface DashboardStats {
  totalProducts: number
  totalLots: number
  lowStockProducts: number
  outOfStockProducts: number
  productsByCategory: { category: string; count: number }[]
  recentLots: {
    productName: string
    lotNumber: string
    quantity: number
    price: number
    entryDate: string
  }[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await axiosClient.get<DashboardStats>('/dashboard/stats')
  return data
}
