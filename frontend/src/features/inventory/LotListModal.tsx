import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpDown } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { getLotes } from './productService'
import type { Lote } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  productId: string
  productName: string
}

export default function LotListModal({ open, onClose, productId, productName }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState<'desc' | 'asc'>('desc')

  const { data: lotes, isLoading } = useQuery({
    queryKey: ['lotes', productId],
    queryFn:  () => getLotes(productId),
    enabled:  open,
  })

  const lotesFiltrados = useMemo(() => {
    if (!lotes) return []

    let resultado = [...lotes]

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      resultado = resultado.filter(l =>
        l.lotNumber.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q)
      )
    }

    resultado.sort((a, b) => {
      const dateA = new Date(a.entryDate).getTime()
      const dateB = new Date(b.entryDate).getTime()
      return orden === 'desc' ? dateB - dateA : dateA - dateB
    })

    return resultado
  }, [lotes, busqueda, orden])

  return (
    <Modal open={open} titulo={`Lotes — ${productName}`} onClose={onClose}>
      <div className="space-y-4">
        {/* filtros */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por número o notas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-300 outline-none"
          />
          <button
            onClick={() => setOrden(o => o === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <ArrowUpDown size={14} />
            {orden === 'desc' ? 'Recientes' : 'Antiguos'}
          </button>
        </div>

        {/* lista */}
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : lotesFiltrados.length === 0 ? (
          <p className="text-center text-slate-300 py-8 text-sm">
            {lotes?.length === 0 ? 'Este producto no tiene lotes' : 'No se encontraron resultados'}
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {lotesFiltrados.map((lote) => (
              <LoteCard key={lote.id} lote={lote} />
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400 text-center pt-1">
          {lotesFiltrados.length} de {lotes?.length ?? 0} lotes
        </p>
      </div>
    </Modal>
  )
}

function LoteCard({ lote }: { lote: Lote }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700 font-mono">{lote.lotNumber}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(lote.entryDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-emerald-600">${lote.price.toFixed(2)}</p>
          <p className="text-xs text-slate-400">{lote.quantity} uds</p>
        </div>
      </div>
      {lote.notes && (
        <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">{lote.notes}</p>
      )}
    </div>
  )
}
