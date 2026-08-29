import React from 'react';

interface ResumenVentasCardProps {
  totalSales?: number;
  percentageGrowth?: number;
}

export const ResumenVentasCard: React.FC<ResumenVentasCardProps> = ({
  totalSales = 12450,
  percentageGrowth = 15,
}) => {
  const daysData = [
    { day: 'Lun', height: '40%', bg: 'bg-primary/20 hover:bg-primary' },
    { day: 'Mar', height: '60%', bg: 'bg-tertiary/30 hover:bg-tertiary' },
    { day: 'Mie', height: '30%', bg: 'bg-primary/20 hover:bg-primary' },
    { day: 'Jue', height: '80%', bg: 'bg-tertiary/30 hover:bg-tertiary' },
    { day: 'Vie', height: '90%', bg: 'bg-primary shadow-[0_0_12px_rgba(37,99,235,0.3)]' },
    { day: 'Sab', height: '50%', bg: 'bg-tertiary/30 hover:bg-tertiary' },
  ];

  return (
    <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-level-1 flex flex-col">
      <h4 className="font-headline text-xl text-on-surface mb-6 flex items-center gap-2 font-semibold">
        <span className="material-symbols-outlined text-primary">bar_chart</span>
        Resumen de Ventas
      </h4>

      <div className="mb-4">
        <div className="font-headline text-3xl font-bold text-on-surface">
          ${totalSales.toLocaleString('en-US')}
        </div>
        <div className="text-xs font-semibold text-tertiary flex items-center gap-1 mt-1">
          <span className="material-symbols-outlined text-sm">arrow_upward</span>
          +{percentageGrowth}% vs mes anterior
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="flex-1 flex items-end justify-between gap-2 mt-4 pt-4 border-t border-outline-variant/30 h-32">
        {daysData.map((item, index) => (
          <div
            key={index}
            style={{ height: item.height }}
            className={`w-full rounded-t-sm transition-colors relative group ${item.bg}`}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {item.day}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
