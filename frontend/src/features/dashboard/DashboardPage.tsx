import { useQuery } from '@tanstack/react-query'
import { Package, Layers, AlertTriangle, XCircle } from 'lucide-react'
import Spinner from '../../components/ui/Spinner'
import { getDashboardStats } from './dashboardService'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  getDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const tarjetas = [
    { label: 'Total productos',  valor: data?.totalProducts ?? 0,     icono: Package,       gradiente: 'from-emerald-400 to-emerald-600' },
    { label: 'Total lotes',      valor: data?.totalLots ?? 0,          icono: Layers,        gradiente: 'from-blue-400 to-blue-600' },
    { label: 'Stock bajo',       valor: data?.lowStockProducts ?? 0,   icono: AlertTriangle, gradiente: 'from-amber-400 to-amber-600' },
    { label: 'Sin stock',        valor: data?.outOfStockProducts ?? 0, icono: XCircle,       gradiente: 'from-rose-400 to-rose-600' },
  ]

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Resumen general del inventario</p>
      </div>

      {/* cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tarjetas.map(({ label, valor, icono: Icono, gradiente }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradiente} flex items-center justify-center mb-3 shadow-sm`}>
              <Icono size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{valor}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* tabla lotes recientes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h2 className="text-sm font-semibold text-slate-700">Últimos lotes ingresados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Producto</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Lote</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">Cantidad</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">Precio</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentLots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-300">Sin lotes registrados</td>
                </tr>
              ) : (
                data?.recentLots.map((lote, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700">{lote.productName}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{lote.lotNumber}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{lote.quantity}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">${lote.price.toFixed(2)}</td>
                    <td className="px-5 py-3 text-slate-400 hidden md:table-cell">
                      {new Date(lote.entryDate).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
