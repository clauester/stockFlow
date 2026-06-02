import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Package } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setCollapsed(!collapsed)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>

        {/* navegación inferior para mobile */}
        <nav className="md:hidden border-t border-gray-200 bg-white flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`
            }
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-1 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`
            }
          >
            <Package size={20} />
            Productos
          </NavLink>
        </nav>
      </div>
    </div>
  )
}
