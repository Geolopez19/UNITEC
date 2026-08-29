import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Panel', path: '/dashboard', icon: 'dashboard' },
    { label: 'Academia', path: '/aprende', icon: 'school' },
    { label: 'Inventario', path: '/inventario', icon: 'inventory_2' },
    { label: 'Ventas', path: '/ventas', icon: 'payments' },
    { label: 'Clientes', path: '/clientes', icon: 'group' },
    { label: 'Reportes', path: '/reportes', icon: 'analytics' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-low flex flex-col py-6 z-20 border-r border-outline-variant/20">
      <div className="px-6 mb-8 flex items-center gap-3">
        <img src={logoImg} alt="RutaPyme Logo" className="h-10 w-auto object-contain" />
        <h1 className="font-headline font-bold text-xl text-on-surface">RutaPyme</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 text-sm font-medium">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/') ||
            (item.path === '/aprende' && location.pathname.startsWith('/aprende'));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 active:scale-[0.98] ${
                isActive
                  ? 'border-l-4 border-tertiary bg-surface text-primary font-semibold shadow-level-1'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-8 mb-6">
        <button className="w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-medium text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-level-1 active:scale-[0.98] cursor-pointer">
          <span className="material-symbols-outlined">add</span>
          Nuevo Registro
        </button>
      </div>

      <div className="mt-auto px-4 space-y-1 text-sm font-medium border-t border-outline-variant/30 pt-4">
        <Link
          to="/configuracion"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 rounded-lg active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">settings</span>
          Configuración
        </Link>
        <Link
          to="/soporte"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 rounded-lg active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">help</span>
          Soporte
        </Link>
      </div>
    </aside>
  );
};
