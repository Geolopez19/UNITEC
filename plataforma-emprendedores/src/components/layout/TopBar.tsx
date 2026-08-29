import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  title?: string;
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title = 'Dashboard', onOpenMobileMenu }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-16 bg-background/90 backdrop-blur-md z-30 flex items-center justify-between px-4 sm:px-6 md:px-8 shadow-level-1 border-b border-outline-variant/20">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-on-surface-variant hover:text-primary p-1.5 cursor-pointer rounded-lg hover:bg-surface-container-high transition-colors"
          title="Menú"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <h2 className="font-headline text-lg sm:text-xl md:text-2xl text-primary font-bold truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="relative w-48 lg:w-64 hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-9 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-full text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-on-surface-variant">
          <button className="hover:text-primary transition-colors cursor-pointer relative p-1" title="Notificaciones">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-2.5 ml-1">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-surface-container overflow-hidden border border-outline-variant shadow-sm flex items-center justify-center font-bold text-primary bg-primary-fixed text-xs sm:text-sm">
              {profile?.business_name ? (
                profile.business_name.substring(0, 2).toUpperCase()
              ) : (
                <span className="material-symbols-outlined text-lg">person</span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-on-surface leading-tight">
                {profile?.business_name || 'Mi Emprendimiento'}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                {user?.email || 'Nivel ' + (profile?.current_level || 1)}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="ml-1 sm:ml-2 hover:text-error text-on-surface-variant transition-colors cursor-pointer p-1"
              title="Cerrar Sesión"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
