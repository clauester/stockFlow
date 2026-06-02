import axiosClient from '../../api/axiosClient'
import type { LoginResponse } from '../../types'

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await axiosClient.post<LoginResponse>('/auth/login', { username, password })
  return data
}
