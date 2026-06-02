interface Props {
  children: React.ReactNode
  color?: 'green' | 'red' | 'yellow' | 'gray'
}

const estilos = {
  green:  'bg-emerald-50 text-emerald-600 border-emerald-100',
  red:    'bg-rose-50 text-rose-600 border-rose-100',
  yellow: 'bg-amber-50 text-amber-600 border-amber-100',
  gray:   'bg-slate-50 text-slate-500 border-slate-100',
}

export default function Badge({ children, color = 'gray' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${estilos[color]}`}>
      {children}
    </span>
  )
}
