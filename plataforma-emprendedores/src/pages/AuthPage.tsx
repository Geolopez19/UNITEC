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

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              business_name: businessName.trim(),
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          if (!data.session) {
            // Email confirmation is required by Supabase configuration
            setSuccessMsg(
              '¡Registro exitoso! Te hemos enviado un correo de confirmación. Por favor revisa tu bandeja de entrada y confirma tu email antes de iniciar sesión.'
            );
            setIsSignUp(false);
          } else {
            // Immediate session created (auto-confirm enabled)
            setSuccessMsg('¡Registro exitoso! Redirigiendo al Diagnóstico Inicial...');
            await refreshProfile();
            setTimeout(() => {
              navigate('/diagnostico');
            }, 1200);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setErrorMsg(
              'Debes confirmar tu correo electrónico antes de iniciar sesión. Por favor revisa tu bandeja de entrada.'
            );
          } else {
            setErrorMsg('Credenciales inválidas o correo no confirmado/registrado.');
          }
        } else {
          await refreshProfile();
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(`Ocurrió un error inesperado: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-4 md:p-8 font-sans text-on-surface">
      <div className="w-full max-w-[1280px] flex flex-col lg:flex-row bg-surface-container-lowest rounded-xl shadow-level-1 overflow-hidden min-h-[600px] border border-outline-variant/20">
        
        {/* Image / Illustration Side */}
        <div
          className="hidden lg:block lg:w-1/2 relative bg-surface-container-low bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex flex-col justify-end p-12 text-white">
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-xl border border-white/10 space-y-2">
              <span className="px-3 py-1 bg-tertiary-fixed-dim/30 text-tertiary-fixed font-semibold text-xs rounded-full inline-block">
                Plataforma de Aceleración
              </span>
              <h3 className="font-headline font-bold text-2xl text-white">
                Impulsa tu Microemprendimiento al Siguiente Nivel
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                Gestión de inventario, facturación simple, cálculo tributario y ruta de crecimiento personalizada en un solo lugar.
              </p>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          
          {/* Logo & Brand Header */}
          <div className="mb-8 flex items-center gap-3">
            <img src={logoImg} alt="RutaPyme Logo" className="h-12 w-auto object-contain" />
            <span className="font-headline text-2xl font-bold text-primary">RutaPyme</span>
          </div>

          <div className="mb-6">
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-2">
              {isSignUp ? 'Crea tu Cuenta de Negocio' : 'Bienvenido de nuevo'}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {isSignUp
                ? 'Registra tu emprendimiento y obtén tu diagnóstico de nivel gratuito.'
                : 'Inicia sesión en tu espacio de trabajo seguro.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-error-container text-on-error-container border border-error/20 text-xs p-3.5 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-tertiary-fixed-dim/20 text-tertiary border border-tertiary/20 text-xs p-3.5 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base">mark_email_read</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-on-surface mb-2" htmlFor="businessName">
                  Nombre de tu Emprendimiento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl">store</span>
                  </div>
                  <input
                    id="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. Comercial Don Pedro"
                    className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm text-on-surface placeholder:text-outline/60"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-medium text-on-surface mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-xl">mail</span>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm text-on-surface placeholder:text-outline/60"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-medium text-on-surface mb-2" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-xl">lock</span>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm text-on-surface placeholder:text-outline/60"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {!isSignUp && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
                  />
                  <span>Recordarme</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Por favor revisa el enlace de restablecimiento de contraseña enviado a tu correo.');
                  }}
                  className="font-medium text-primary hover:text-on-primary-fixed-variant transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-medium text-sm text-on-primary bg-primary hover:bg-on-primary-fixed-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Procesando...</span>
                ) : isSignUp ? (
                  <>
                    <span>Crear Cuenta & Confirmar Correo</span>
                    <span className="material-symbols-outlined text-base">send</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <span className="material-symbols-outlined text-base">login</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle Link */}
          <div className="mt-6 text-center text-xs text-on-surface-variant">
            {isSignUp ? (
              <p>
                ¿Ya tienes una cuenta?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-primary hover:underline ml-1 cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              </p>
            ) : (
              <p>
                ¿No tienes una cuenta?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-primary hover:underline ml-1 cursor-pointer"
                >
                  Crear una cuenta
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
