import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../../components/ui/Modal'
import { alertaExito, alertaError } from '../../utils/alerts'
import { crearProducto, actualizarProducto } from './productService'
import type { Producto } from '../../types'

const esquema = z.object({
  name:        z.string().min(1, 'El nombre es requerido'),
  description: z.string(),
  code:        z.string().trim().min(1, 'El código es requerido').regex(/^PRD/, 'El código debe comenzar con PRD'),
  units:       z.number().min(0, 'Las unidades no pueden ser negativas'),
})

type FormData = z.infer<typeof esquema>

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  producto?: Producto | null
}

export default function ProductForm({ open, onClose, onSuccess, producto }: Props) {
  const esEdicion = !!producto

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(esquema),
    defaultValues: { name: '', description: '', code: '', units: 0 },
  })

  useEffect(() => {
    if (open) {
      reset({
        name:        producto?.name        ?? '',
        description: producto?.description ?? '',
        code:        producto?.code        ?? '',
        units:       producto?.units       ?? 0,
      })
    }
  }, [open, producto, reset])

  async function onSubmit(data: FormData) {
    try {
      if (esEdicion && producto) {
        await actualizarProducto(producto.id, data)
        alertaExito('Producto actualizado')
      } else {
        await crearProducto(data)
        alertaExito('Producto creado')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      const msg = error.response?.data?.message ?? 'Error al guardar el producto'
      alertaError(msg)
    }
  }

  const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 outline-none'

  return (
    <Modal open={open} titulo={esEdicion ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Nombre</label>
          <input {...register('name')} className={inputClass} placeholder="Laptop Dell XPS" />
          {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Descripción</label>
          <textarea {...register('description')} rows={2} className={`${inputClass} resize-none`} placeholder="Descripción opcional" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Código</label>
            <input {...register('code')} className={inputClass} placeholder="PRD-001" />
            {errors.code && <p className="text-rose-500 text-xs mt-1">{errors.code.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Unidades</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              onChange={(e) => setValue('units', Number(e.target.value))}
              defaultValue={producto?.units ?? 0}
            />
            {errors.units && <p className="text-rose-500 text-xs mt-1">{errors.units.message}</p>}
          </div>
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
