import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Package } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { login } from './authService'

const esquema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormData = z.infer<typeof esquema>

export default function LoginPage() {
  const { login: guardarSesion } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(esquema),
  })

  async function onSubmit(data: FormData) {
    try {
      const respuesta = await login(data.username, data.password)
      guardarSesion(respuesta.token, {
        id: '',
        username: respuesta.username,
        email: respuesta.email,
        role: respuesta.role,
      })
      navigate('/')
    } catch {
      toast.error('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
            <Package className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-semibold text-slate-800">StockFlow</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de inventario</p>
        </div>

        {/* formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Usuario</label>
              <input
                {...register('username')}
                type="text"
                autoComplete="username"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
                placeholder="admin"
              />
              {errors.username && (
                <p className="text-rose-500 text-xs mt-1.5">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Contraseña</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-rose-500 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-all duration-200 shadow-sm shadow-emerald-200"
            >
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Prueba técnica — Full Stack .NET + React
        </p>
      </div>
    </div>
  )
}
