import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal'
import { crearProducto, actualizarProducto } from './productService'
import type { Producto } from '../../types'

const esquema = z.object({
  name:        z.string().min(1, 'El nombre es requerido'),
  description: z.string(),
  category:    z.string().min(1, 'La categoría es requerida'),
  sku:         z.string().min(1, 'El SKU es requerido'),
  stock:       z.number().min(0, 'El stock no puede ser negativo'),
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
    defaultValues: { name: '', description: '', category: '', sku: '', stock: 0 },
  })

  useEffect(() => {
    if (open) {
      reset({
        name:        producto?.name        ?? '',
        description: producto?.description ?? '',
        category:    producto?.category    ?? '',
        sku:         producto?.sku         ?? '',
        stock:       producto?.stock       ?? 0,
      })
    }
  }, [open, producto, reset])

  async function onSubmit(data: FormData) {
    try {
      if (esEdicion && producto) {
        await actualizarProducto(producto.id, data)
        toast.success('Producto actualizado')
      } else {
        await crearProducto(data)
        toast.success('Producto creado')
      }
      onSuccess()
      onClose()
    } catch (error: any) {
      const msg = error.response?.data?.message ?? 'Error al guardar el producto'
      toast.error(msg)
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
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Categoría</label>
            <input {...register('category')} className={inputClass} placeholder="Electrónica" />
            {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">SKU</label>
            <input {...register('sku')} className={inputClass} placeholder="PROD-001" />
            {errors.sku && <p className="text-rose-500 text-xs mt-1">{errors.sku.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Stock inicial</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            onChange={(e) => setValue('stock', Number(e.target.value))}
            defaultValue={producto?.stock ?? 0}
          />
          {errors.stock && <p className="text-rose-500 text-xs mt-1">{errors.stock.message}</p>}
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
