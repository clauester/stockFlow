import { Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface Props {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: Props) {
  const { usuario } = useAuth()

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-5 py-3.5 flex items-center justify-between sticky top-0 z-10">
      <button
        onClick={onToggleSidebar}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-semibold uppercase">
            {usuario?.username?.charAt(0)}
          </span>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-700 leading-tight">{usuario?.username}</p>
          <p className="text-xs text-slate-400">{usuario?.role}</p>
        </div>
      </div>
    </header>
  )
}
