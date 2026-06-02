import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface Props {
  collapsed: boolean
}

const links = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
]

export default function Sidebar({ collapsed }: Props) {
  const { logout, usuario } = useAuth()

  return (
    <aside className={`hidden md:flex flex-col bg-white/80 backdrop-blur-sm border-r border-slate-100 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}>
      {/* logo */}
      <div className={`flex items-center gap-3 px-5 py-5 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-200">
          <Package className="text-white" size={18} />
        </div>
        {!collapsed && <span className="font-semibold text-slate-800 text-sm">StockFlow</span>}
      </div>

      {/* navegación */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <Icon size={18} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* footer */}
      <div className={`px-3 py-4 border-t border-slate-100 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <p className="text-xs text-slate-400 px-3 mb-2 truncate">{usuario?.username}</p>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 w-full ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && 'Salir'}
        </button>
      </div>
    </aside>
  )
}
