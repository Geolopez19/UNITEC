import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireDiagnostic?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireDiagnostic = true,
}) => {
  const { user, profile, loading } = useAuth();
  const [checkingDiag, setCheckingDiag] = useState<boolean>(true);
  const [hasDiagnostic, setHasDiagnostic] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDiagnostic = async () => {
      if (!user) {
        setCheckingDiag(false);
        return;
      }

      // If user profile level is already updated (> 1), skip DB query
      if (profile && profile.current_level && profile.current_level > 1) {
        setHasDiagnostic(true);
        setCheckingDiag(false);
        return;
      }

      try {
        const { data, error } = await (supabase.from('diagnostic_responses') as any)
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error checking diagnostic response:', error.message);
          setHasDiagnostic(false);
        } else {
          setHasDiagnostic(data && data.length > 0);
        }
      } catch (err) {
        console.error('Unexpected error checking diagnostic status:', err);
        setHasDiagnostic(false);
      } finally {
        setCheckingDiag(false);
      }
    };

    if (user && requireDiagnostic) {
      checkDiagnostic();
    } else {
      setCheckingDiag(false);
    }
  }, [user, profile, requireDiagnostic]);

  if (loading || checkingDiag) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-300">Cargando datos de sesión...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireDiagnostic && hasDiagnostic === false && (!profile || profile.current_level === 1)) {
    return <Navigate to="/diagnostico" replace />;
  }

  return <>{children}</>;
};
