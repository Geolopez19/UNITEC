import React from 'react';

interface RutaPersonalizadaCardProps {
  currentLevel?: number;
}

export const RutaPersonalizadaCard: React.FC<RutaPersonalizadaCardProps> = ({ currentLevel = 2 }) => {
  return (
    <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-level-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-headline text-xl text-on-surface flex items-center gap-2 font-semibold">
          <span className="material-symbols-outlined text-primary">route</span>
          Tu Ruta Personalizada - Nivel {currentLevel}
        </h4>
        <span className="px-3 py-1 bg-tertiary-fixed-dim/20 text-tertiary font-semibold text-xs rounded-full">
          En progreso
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center py-4 relative">
        {/* Progress line */}
        <div className="absolute left-[24px] top-4 bottom-4 w-1 bg-surface-container-high rounded-full -z-10"></div>
        <div className="absolute left-[24px] top-4 h-[50%] w-1 bg-tertiary rounded-full -z-10 shadow-[0_0_8px_rgba(0,98,66,0.4)]"></div>

        <div className="space-y-8 relative">
          {/* Step 1 (Completed) */}
          <div className="flex items-start gap-4 opacity-70">
            <div className="w-12 h-12 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined">check</span>
            </div>
            <div>
              <h5 className="font-medium text-sm text-on-surface">Fase 1: Configuración Inicial</h5>
              <p className="text-xs text-on-surface-variant mt-1">Perfil completado y catálogo subido.</p>
            </div>
          </div>

          {/* Step 2 (Current) */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-level-2 ring-4 ring-primary-fixed">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                trending_up
              </span>
            </div>
            <div>
              <h5 className="font-bold text-sm text-primary">Fase 2: Expansión de Ventas</h5>
              <p className="text-xs text-on-surface-variant mt-1 mb-3">
                Lanza tu primera campaña de email marketing.
              </p>
              <button className="bg-surface-container hover:bg-primary hover:text-on-primary text-primary transition-colors duration-200 text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer">
                Comenzar campaña
              </button>
            </div>
          </div>

          {/* Step 3 (Upcoming) */}
          <div className="flex items-start gap-4 opacity-50">
            <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <div>
              <h5 className="font-medium text-sm text-on-surface">Fase 3: Optimización Fiscal</h5>
              <p className="text-xs text-on-surface-variant mt-1">
                Se desbloquea al alcanzar 50 ventas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
