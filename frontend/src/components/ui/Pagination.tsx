interface Props {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1.5 mt-5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all"
      >
        Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
            p === page
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all"
      >
        Siguiente
      </button>
    </div>
  )
}
