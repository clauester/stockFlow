import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import { alertaExito, alertaError } from '../../utils/alerts'
import { crearLote, actualizarLote } from './productService'
import type { Lote } from '../../types'

const esquema = z.object({
  lotNumber: z.string().trim().min(1, 'El número de lote es requerido').regex(/^LOT/, 'El número de lote debe comenzar con LOT'),
  price:     z.number().min(0.01, 'El precio debe ser mayor a 0'),
  quantity:  z.number().min(1, 'La cantidad debe ser al menos 1'),
  entryDate: z.string().min(1, 'La fecha es requerida'),
  notes:     z.string(),
})

type FormData = z.infer<typeof esquema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  productId: string
  lote?: Lote | null
}

export default function LotForm({ open, onClose, onSuccess, productId, lote }: Props) {
  const esEdicion = !!lote

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(esquema),
    defaultValues: { lotNumber: '', price: 0, quantity: 1, entryDate: '', notes: '' },
  })

  useEffect(() => {
    if (open) {
      reset({
        lotNumber: lote?.lotNumber ?? '',
        price:     lote?.price     ?? 0,
        quantity:  lote?.quantity  ?? 1,
        entryDate: lote ? lote.entryDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        notes:     lote?.notes ?? '',
      })
    }
  }, [open, lote, reset])

  async function onSubmit(data: FormData) {
    try {
      const payload = {
        ...data,
        entryDate: new Date(data.entryDate).toISOString(),
      }
      if (esEdicion && lote) {
        await actualizarLote(productId, lote.id, payload)
        alertaExito('Lote actualizado')
      } else {
        await crearLote(productId, payload)
        alertaExito('Lote agregado')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      const msg = error.response?.data?.message ?? 'Error al guardar el lote'
      alertaError(msg)
    }
  }

  const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 outline-none'

  return (
    <Modal open={open} titulo={esEdicion ? 'Editar lote' : 'Agregar lote'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Número de lote</label>
          <input {...register('lotNumber')} className={inputClass} placeholder="LOT-2024-001" />
          {errors.lotNumber && <p className="text-rose-500 text-xs mt-1">{errors.lotNumber.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Precio</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              defaultValue={lote?.price ?? 0}
              onChange={(e) => setValue('price', Number(e.target.value))}
            />
            {errors.price && <p className="text-rose-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Cantidad</label>
            <input
              type="number"
              min="1"
              className={inputClass}
              defaultValue={lote?.quantity ?? 1}
              onChange={(e) => setValue('quantity', Number(e.target.value))}
            />
            {errors.quantity && <p className="text-rose-500 text-xs mt-1">{errors.quantity.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Fecha de ingreso</label>
          <input {...register('entryDate')} type="date" className={inputClass} />
          {errors.entryDate && <p className="text-rose-500 text-xs mt-1">{errors.entryDate.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Notas</label>
          <textarea {...register('notes')} rows={2} className={`${inputClass} resize-none`} placeholder="Opcional" />
        </div>

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm shadow-emerald-200"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
