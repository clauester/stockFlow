import { useQuery } from '@tanstack/react-query'
import { Box, Layers3, TrendingUp, ShieldAlert } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Resumen</h1>
        <p className="text-sm text-slate-400">Vista general del inventario</p>
      </div>

      {/* métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Productos"  valor={data?.totalProducts ?? 0}     icono={<Box size={18} />}           color="emerald" />
        <MetricCard label="Lotes"      valor={data?.totalLots ?? 0}          icono={<Layers3 size={18} />}       color="sky" />
        <MetricCard label="Stock bajo" valor={data?.lowStockProducts ?? 0}   icono={<TrendingUp size={18} />}    color="amber" />
        <MetricCard label="Agotados"   valor={data?.outOfStockProducts ?? 0} icono={<ShieldAlert size={18} />}   color="rose" />
      </div>

      {/* lotes recientes */}
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
                  <td colSpan={5} className="text-center py-12 text-slate-300">Sin lotes registrados aún</td>
                </tr>
              ) : (
                data?.recentLots.map((lote, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-700">{lote.productName}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{lote.lotNumber}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">{lote.quantity}</td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell">${lote.price.toFixed(2)}</td>
                    <td className="px-5 py-3 text-slate-400 hidden md:table-cell">
                      {new Date(lote.entryDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
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

function MetricCard({ label, valor, icono, color }: { label: string; valor: number; icono: React.ReactNode; color: string }) {
  const colores: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    sky:     'bg-sky-50 text-sky-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-rose-600',
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colores[color]}`}>
        {icono}
      </div>
      <p className="text-2xl font-bold text-slate-800">{valor}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}
