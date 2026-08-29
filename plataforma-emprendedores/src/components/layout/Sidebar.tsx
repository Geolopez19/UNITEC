import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
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
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[260px] bg-surface-container-low flex-col py-6 z-20 border-r border-outline-variant/20">
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

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container-low flex flex-col py-6 z-50 border-r border-outline-variant/20 md:hidden transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="RutaPyme Logo" className="h-9 w-auto object-contain" />
            <h1 className="font-headline font-bold text-lg text-on-surface">RutaPyme</h1>
          </div>
          <button onClick={onCloseMobile} className="text-on-surface-variant p-1">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 text-sm font-medium overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/') ||
              (item.path === '/aprende' && location.pathname.startsWith('/aprende'));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? 'border-l-4 border-tertiary bg-surface text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 space-y-1 text-xs font-medium border-t border-outline-variant/30 pt-4">
          <Link
            to="/configuracion"
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high rounded-xl"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            Configuración
          </Link>
          <Link
            to="/soporte"
            onClick={onCloseMobile}
            className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high rounded-xl"
          >
            <span className="material-symbols-outlined text-lg">help</span>
            Soporte
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Hidden on md and up) */}
      <nav className="fixed bottom-0 left-0 w-full bg-surface-container-low/95 backdrop-blur-md border-t border-outline-variant/20 flex items-center justify-around py-2 px-2 md:hidden z-30 shadow-level-2">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
            location.pathname === '/dashboard' || location.pathname === '/'
              ? 'text-primary'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span>Panel</span>
        </Link>

        <Link
          to="/aprende"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
            location.pathname.startsWith('/aprende')
              ? 'text-primary'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-xl">school</span>
          <span>Academia</span>
        </Link>

        <Link
          to="/inventario"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
            location.pathname === '/inventario'
              ? 'text-primary'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-xl">inventory_2</span>
          <span>Inventario</span>
        </Link>

        <Link
          to="/ventas"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
            location.pathname === '/ventas'
              ? 'text-primary'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-xl">payments</span>
          <span>Ventas</span>
        </Link>

        <Link
          to="/reportes"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold ${
            location.pathname === '/reportes' || location.pathname === '/clientes'
              ? 'text-primary'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-xl">analytics</span>
          <span>Reportes</span>
        </Link>
      </nav>
    </>
  );
};
