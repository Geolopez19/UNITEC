import React from 'react';

interface ProximosImpuestosCardProps {
  taxType?: string;
  daysRemaining?: number;
  dueDateLabel?: string;
}

export const ProximosImpuestosCard: React.FC<ProximosImpuestosCardProps> = ({
  taxType = 'Declaración mensual de IVA',
  daysRemaining = 3,
  dueDateLabel = '15 de Mes',
}) => {
  return (
    <div className="md:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-level-1 border border-outline-variant/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-error-container rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-headline text-xl text-on-surface flex items-center gap-2 mb-2 font-semibold">
            <span className="material-symbols-outlined text-error">warning</span>
            Próximos Impuestos
          </h4>
          <p className="text-sm text-on-surface-variant">{taxType}</p>
        </div>
        <div className="bg-error-container text-on-error-container px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          En {daysRemaining} días
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="text-xs text-outline mb-1 uppercase tracking-wider font-medium">
            Fecha clave
          </p>
          <p className="font-headline text-2xl font-bold text-on-surface">{dueDateLabel}</p>
        </div>
        <button className="border border-outline hover:border-primary hover:text-primary text-on-surface-variant font-medium text-xs px-4 py-2 rounded-lg transition-colors bg-surface-container-lowest cursor-pointer">
          Revisar detalles
        </button>
      </div>
    </div>
  );
};
