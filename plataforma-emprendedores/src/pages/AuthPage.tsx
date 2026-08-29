import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 12-second timeout guard to allow Supabase free-tier cold starts
  const withTimeout = <T,>(promise: Promise<T>, ms = 12000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('La conexión tardó demasiado. Por favor verifica tus credenciales o el estado de tu red.')), ms)
      ),
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!businessName.trim()) {
          setErrorMsg('Por favor ingresa el nombre de tu emprendimiento.');
          setLoading(false);
          return;
        }

        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                business_name: businessName.trim(),
              },
            },
          })
        );

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          if (!data.session) {
            setSuccessMsg(
              '¡Registro exitoso! Te hemos enviado un correo de confirmación. Por favor revisa tu bandeja de entrada y confirma tu email antes de iniciar sesión.'
            );
            setIsSignUp(false);
          } else {
            setSuccessMsg('¡Registro exitoso! Redirigiendo al Diagnóstico Inicial...');
            refreshProfile().catch(() => {});
            navigate('/diagnostico');
          }
        }
      } else {
        const { error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          })
        );

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMsg(
              'Debes confirmar tu correo electrónico antes de iniciar sesión. Por favor revisa tu bandeja de entrada.'
            );
          } else {
            setErrorMsg('Credenciales inválidas o correo no registrado.');
          }
          setLoading(false);
        } else {
          setLoading(false);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Ocurrió un problema de conexión.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4 md:p-8 font-sans text-on-surface">
      <div className="w-full max-w-[1280px] flex flex-col lg:flex-row bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden min-h-[600px] border border-outline-variant/20">
        {/* Left Form Panel */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImg} alt="RutaPyme Logo" className="h-10 w-auto object-contain" />
            <h1 className="font-headline font-bold text-2xl text-on-surface">RutaPyme</h1>
          </div>

          <div className="max-w-md w-full mx-auto my-auto space-y-6">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold text-on-surface">
                {isSignUp ? 'Crea tu Cuenta' : 'Bienvenido de Nuevo'}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {isSignUp
                  ? 'Completa tus datos para acelerar tu emprendimiento.'
                  : 'Ingresa tus credenciales para acceder a tu panel de control.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-lg bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-lg bg-tertiary-fixed-dim/20 border border-tertiary text-tertiary text-xs font-semibold flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Nombre de tu Emprendimiento / Negocio
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                      storefront
                    </span>
                    <input
                      type="text"
                      required={isSignUp}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ej. Panadería San José"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-background text-on-surface text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-background text-on-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary bg-background text-on-surface text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-bold text-sm rounded-lg transition-all shadow-level-1 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : isSignUp ? (
                  'Crear Cuenta'
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                {isSignUp
                  ? '¿Ya tienes una cuenta? Inicia Sesión'
                  : '¿No tienes cuenta aún? Regístrate gratis'}
              </button>
            </div>
          </div>

          <div className="text-xs text-on-surface-variant text-center lg:text-left mt-8">
            © {new Date().getFullYear()} RutaPyme. Todos los derechos reservados.
          </div>
        </div>

        {/* Right Hero Banner */}
        <div className="hidden lg:flex w-1/2 bg-surface-container-high relative p-12 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-tertiary/5 to-transparent pointer-events-none"></div>
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="Microemprendedores trabajando"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />

          <div className="relative z-10 flex justify-end">
            <span className="px-3 py-1 bg-surface-container-lowest/80 backdrop-blur-md rounded-full text-xs font-semibold text-primary border border-outline-variant/30">
              Plataforma para Microemprendedores
            </span>
          </div>

          <div className="relative z-10 space-y-4 max-w-lg">
            <blockquote className="font-headline text-2xl font-bold text-on-surface leading-snug">
              "Acelera la madurez digital y financiera de tu empresa con herramientas diseñadas a tu medida."
            </blockquote>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Diagnósticos inteligentes, inventario en tiempo real, catálogo de aprendizaje y proyecciones fiscales en una sola plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
