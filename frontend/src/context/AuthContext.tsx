import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Usuario } from '../types'

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  function login(nuevoToken: string, nuevoUsuario: Usuario) {
    localStorage.setItem('token', nuevoToken)
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario))
    setToken(nuevoToken)
    setUsuario(nuevoUsuario)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
