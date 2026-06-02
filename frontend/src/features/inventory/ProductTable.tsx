import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, PackagePlus, Search, Eye } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import ProductForm from './ProductForm'
import LotForm from './LotForm'
import LotListModal from './LotListModal'
import { getProductos, eliminarProducto } from './productService'
import { alertaExito, alertaError, confirmarEliminacion } from '../../utils/alerts'
import type { Producto, FiltrosProducto } from '../../types'

export default function ProductTable() {
  const queryClient = useQueryClient()

  const [filtros, setFiltros] = useState<FiltrosProducto>({ page: 1, pageSize: 100 })
  const [modalProducto, setModalProducto] = useState(false)
  const [modalLote, setModalLote]         = useState(false)
  const [modalVerLotes, setModalVerLotes] = useState(false)
  const [productoActual, setProductoActual] = useState<Producto | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['productos', filtros],
    queryFn:  () => getProductos(filtros),
  })

  function abrirEditar(p: Producto) {
    setProductoActual(p)
    setModalProducto(true)
  }

  function abrirLote(p: Producto) {
    setProductoActual(p)
    setModalLote(true)
  }

  function abrirVerLotes(p: Producto) {
    setProductoActual(p)
    setModalVerLotes(true)
  }

  function abrirNuevo() {
    setProductoActual(null)
    setModalProducto(true)
  }

  async function handleEliminar(p: Producto) {
    const confirmado = await confirmarEliminacion(p.name)
    if (!confirmado) return
    try {
      await eliminarProducto(p.id)
      alertaExito('Producto eliminado correctamente')
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    } catch {
      alertaError('No se pudo eliminar el producto')
    }
  }

  function getStockBadge(units: number) {
    if (units === 0) return <Badge color="red">Agotado</Badge>
    if (units <= 5)  return <Badge color="yellow">{units} uds</Badge>
    return <Badge color="green">{units} uds</Badge>
  }

  const inputClass = 'bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-300 transition-all'

  return (
    <div>
      {/* barra de filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className={`${inputClass} pl-9 w-full`}
            onChange={(e) => setFiltros(f => ({ ...f, name: e.target.value, page: 1 }))}
          />
        </div>
        <input
          type="text"
          placeholder="Código"
          className={`${inputClass} w-full sm:w-36`}
          onChange={(e) => setFiltros(f => ({ ...f, code: e.target.value, page: 1 }))}
        />
        <button
          onClick={abrirNuevo}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm shadow-emerald-200 whitespace-nowrap"
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      {/* tabla */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wide">Producto</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">Código</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wide">Unidades</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                <span className="inline-flex items-center gap-1">
                  Precio actual
                  <span className="relative group cursor-pointer">
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold">i</span>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 px-3 py-2 bg-slate-800 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[999] text-center leading-snug shadow-lg">
                      Precio del último lote registrado para este producto
                    </span>
                  </span>
                </span>
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wide hidden lg:table-cell">Lotes</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex justify-center"><Spinner /></div>
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              data?.data.map((producto) => (
                <tr key={producto.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{producto.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{producto.description}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 font-mono text-xs hidden sm:table-cell">{producto.code}</td>
                  <td className="px-5 py-3.5">{getStockBadge(producto.units)}</td>
                  <td className="px-5 py-3.5 text-slate-600 hidden sm:table-cell">
                    {producto.lastPrice ? `$${producto.lastPrice.toFixed(2)}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 hidden lg:table-cell">{producto.lots.length}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-0.5 justify-end">
                      <button
                        onClick={() => abrirVerLotes(producto)}
                        title="Ver lotes"
                        className="p-2 rounded-lg text-slate-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => abrirLote(producto)}
                        title="Agregar lote"
                        className="p-2 rounded-lg text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                      >
                        <PackagePlus size={15} />
                      </button>
                      <button
                        onClick={() => abrirEditar(producto)}
                        title="Editar"
                        className="p-2 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleEliminar(producto)}
                        title="Eliminar"
                        className="p-2 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <Pagination
          page={filtros.page ?? 1}
          totalPages={data.totalPages}
          onPageChange={(p) => setFiltros(f => ({ ...f, page: p }))}
        />
      )}

      <ProductForm
        open={modalProducto}
        onClose={() => setModalProducto(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['productos'] })}
        producto={productoActual}
      />

      {productoActual && (
        <LotForm
          open={modalLote}
          onClose={() => setModalLote(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['productos'] })}
          productId={productoActual.id}
        />
      )}

      {productoActual && (
        <LotListModal
          open={modalVerLotes}
          onClose={() => setModalVerLotes(false)}
          productId={productoActual.id}
          productName={productoActual.name}
        />
      )}
    </div>
  )
}
