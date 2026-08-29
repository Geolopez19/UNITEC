import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const Home: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [dbStatus, setDbStatus] = useState<string>('Comprobando conexión con Supabase...');
  const [dbSuccess, setDbSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
          // If connection credentials are invalid or table not created yet
          if (error.code === 'PGRST301' || error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
            setDbStatus('⚠️ No se ha configurado la URL / Anon Key de Supabase válida en el archivo .env.');
            setDbSuccess(false);
          } else {
            setDbStatus(`💡 Conexión al servidor exitosa (Respuesta Supabase: ${error.message})`);
            setDbSuccess(true);
          }
        } else {
          setDbStatus('✅ Conexión con Supabase establecida correctamente. Base de datos accesible.');
          setDbSuccess(true);
        }
      } catch (err) {
        setDbStatus(`❌ Error de conexión: ${(err as Error).message}`);
        setDbSuccess(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xl">
            🚀
          </div>
          <div>
            <h1 className="text-2xl font-bold">Plataforma para Microemprendedores</h1>
            <p className="text-sm text-slate-400">UNITEC - Fase 0 Setup & Supabase Integration</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Estado de Conexión Supabase
          </h2>
          <p className={`text-sm font-medium ${dbSuccess === true ? 'text-emerald-400' : dbSuccess === false ? 'text-amber-400' : 'text-slate-300'}`}>
            {dbStatus}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Estado de Autenticación
          </h2>
          {loading ? (
            <p className="text-sm text-slate-400">Cargando estado de usuario...</p>
          ) : user ? (
            <div className="space-y-1 text-sm">
              <p><span className="text-slate-400">Usuario ID:</span> {user.id}</p>
              <p><span className="text-slate-400">Email:</span> {user.email}</p>
              <p><span className="text-slate-400">Emprendimiento:</span> {profile?.business_name || 'Sin especificar'}</p>
              <p><span className="text-slate-400">Nivel Actual:</span> {profile?.current_level || 1}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-300">
              No hay usuario autenticado actualmente. El módulo de Auth (Fase 1) estará disponible próximamente.
            </p>
          )}
        </div>

        <div className="border-t border-slate-700/60 pt-4 flex justify-between items-center text-xs text-slate-400">
          <span>Stack: React 19 + TypeScript + Vite + Tailwind CSS + Supabase</span>
          <span>Fase 0 OK</span>
        </div>
      </div>
    </div>
  );
};
