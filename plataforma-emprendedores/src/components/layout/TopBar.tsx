import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title = 'Dashboard' }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-16 bg-background/80 backdrop-blur-md z-10 flex items-center justify-between px-8 shadow-level-1 border-b border-outline-variant/20">
      <div className="flex items-center gap-4">
        <h2 className="font-headline text-2xl text-primary font-bold">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-64 hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-on-surface"
          />
        </div>

        <div className="flex items-center gap-4 text-on-surface-variant">
          <button className="hover:text-primary transition-colors cursor-pointer relative" title="Notificaciones">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="hover:text-primary transition-colors cursor-pointer" title="Calendario">
            <span className="material-symbols-outlined">calendar_today</span>
          </button>
          <div className="flex items-center gap-3 ml-2">
            <div className="h-9 w-9 rounded-full bg-surface-container overflow-hidden border border-outline-variant shadow-sm flex items-center justify-center font-bold text-primary bg-primary-fixed">
              {profile?.business_name ? (
                profile.business_name.substring(0, 2).toUpperCase()
              ) : (
                <span className="material-symbols-outlined text-xl">person</span>
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
              className="ml-2 hover:text-error text-on-surface-variant transition-colors cursor-pointer"
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
