import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  titulo: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ open, titulo, onClose, children }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/50 w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">{titulo}</h2>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors p-1 rounded-lg hover:bg-slate-50"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
