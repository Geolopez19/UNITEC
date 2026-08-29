import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../utils/currency';

interface CategoryPerformance {
  category: string;
  revenue: number;
  expenses: number;
  margin: number;
  status: 'Excelente' | 'Estable' | 'En Observación';
}

const SAMPLE_PERFORMANCE: CategoryPerformance[] = [
  {
    category: 'Servicios & Consultoría',
    revenue: 24500.00,
    expenses: 4200.00,
    margin: 82,
    status: 'Excelente',
  },
  {
    category: 'Venta de Licencias & Muebles',
    revenue: 15300.00,
    expenses: 6100.00,
    margin: 60,
    status: 'Estable',
  },
  {
    category: 'Soporte Técnico & Mantenimiento',
    revenue: 5431.89,
    expenses: 2150.00,
    margin: 60,
    status: 'Estable',
  },
];

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [totalRevenue, setTotalRevenue] = useState<number>(45231.89);
  const [totalExpenses, setTotalExpenses] = useState<number>(12450.00);
  const [categories] = useState<CategoryPerformance[]>(SAMPLE_PERFORMANCE);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q3 2023');

  useEffect(() => {
    const fetchFinancialData = async () => {
      const userId = user?.id || 'guest';
      const salesKey = `rutapyme_sales_${userId}`;
      let sumSales = 0;

      // 1. Local sales calculation
      try {
        const stored = localStorage.getItem(salesKey);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            sumSales = list.reduce((acc: number, s: any) => (s.status !== 'Cancelado' ? acc + (Number(s.amount) || 0) : acc), 0);
          }
        }
      } catch (e) {
        console.error(e);
      }

      // 2. Supabase sales calculation
      try {
        if (user) {
          const { data: invData } = await (supabase.from('invoices') as any)
            .select('total_amount')
            .eq('status', 'paid');

          if (invData && invData.length > 0) {
            const supaSum = invData.reduce((acc: number, item: any) => acc + (Number(item.total_amount) || 0), 0);
            if (supaSum > sumSales) sumSales = supaSum;
          }
        }
      } catch (err) {
        console.error('Error loading financial reports:', err);
      }

      if (sumSales > 0) {
        setTotalRevenue(sumSales);
        setTotalExpenses(sumSales * 0.28); // 28% operating expenses ratio
      }
    };

    fetchFinancialData();
  }, [user]);

  const netMargin = totalRevenue - totalExpenses;
  const marginPercentage = totalRevenue > 0 ? Math.round((netMargin / totalRevenue) * 100) : 0;

  // Export CSV Functionality
  const handleExportCSV = () => {
    const headers = ['Categoria', 'Ingresos (C$)', 'Gastos (C$)', 'Margen %', 'Estado'];
    const rows = categories.map((c) => [
      `"${c.category}"`,
      c.revenue.toFixed(2),
      c.expenses.toFixed(2),
      `${c.margin}%`,
      `"${c.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Financiero_RutaPyme_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF (Print View)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <DashboardLayout title="Reportes - RutaPyme">
      {/* Action Bar & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            Resumen Financiero
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Análisis de rendimiento, gastos operativos y margen neto de la pyme.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl font-bold text-xs hover:bg-surface-container-low transition-colors flex items-center gap-2 bg-surface cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-base">table_view</span>
            Exportar Excel (CSV)
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metric 1: Ingresos Totales */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-tertiary-container/10 text-tertiary font-bold text-xs">
              +12.5% vs mes anterior
            </span>
          </div>
          <h3 className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Ingresos Totales</h3>
          <p className="font-headline text-3xl font-bold text-on-surface">{formatCurrency(totalRevenue)}</p>
        </div>

        {/* Metric 2: Gastos Operativos */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-error-container/40 text-error flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-error-container/30 text-error font-bold text-xs">
              +3.2% en costos
            </span>
          </div>
          <h3 className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Gastos Operativos</h3>
          <p className="font-headline text-3xl font-bold text-on-surface">{formatCurrency(totalExpenses)}</p>
        </div>

        {/* Metric 3: Margen Neto */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">savings</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-tertiary-container/10 text-tertiary font-bold text-xs">
              {marginPercentage}% Margen de ganancia
            </span>
          </div>
          <h3 className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Margen Neto</h3>
          <p className="font-headline text-3xl font-bold text-on-surface">{formatCurrency(netMargin)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Main Growth Projections Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Proyecciones de Crecimiento</h3>
              <p className="text-xs text-on-surface-variant">Tendencia histórica de ingresos mensuales</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-surface-container-high border-none text-on-surface font-semibold text-xs rounded-xl py-1.5 px-3"
            >
              <option value="Q3 2023">Este Año (2026)</option>
              <option value="Q2 2023">Año Anterior</option>
            </select>
          </div>

          <div className="w-full h-56 flex items-end justify-between gap-3 pt-6 border-b border-outline-variant/30 px-2">
            {[
              { m: 'Ene', val: 40 },
              { m: 'Feb', val: 48 },
              { m: 'Mar', val: 55 },
              { m: 'Abr', val: 52 },
              { m: 'May', val: 65 },
              { m: 'Jun', val: 70 },
              { m: 'Jul', val: 82 },
              { m: 'Ago', val: 90 },
              { m: 'Sep', val: 95 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                <div
                  style={{ height: `${bar.val}%` }}
                  className="w-full bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-300 relative"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(bar.val * 480)}
                  </div>
                </div>
                <span className="text-[10px] text-on-surface-variant font-bold">{bar.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Distribution */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20 flex flex-col justify-between">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-6">Distribución de Gastos</h3>
          
          {/* Custom Doughnut Visual */}
          <div className="flex-1 flex items-center justify-center my-4">
            <div className="w-40 h-40 rounded-full border-[12px] border-primary flex items-center justify-center relative shadow-inner">
              <div className="text-center">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Gastos Totales</p>
                <p className="font-headline font-bold text-sm text-on-surface">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-on-surface">Nómina & Salarios</span>
              </div>
              <span className="font-bold text-on-surface">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                <span className="text-on-surface">Operaciones & Local</span>
              </div>
              <span className="font-bold text-on-surface">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-outline"></div>
                <span className="text-on-surface">Marketing & Publicidad</span>
              </div>
              <span className="font-bold text-on-surface">25%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 border border-outline-variant/20 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
          <h3 className="font-headline text-lg font-bold text-on-surface">Rendimiento por Categoría</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs border-b border-outline-variant/30 uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6 text-right">Ingresos (C$)</th>
                <th className="py-4 px-6 text-right">Gastos (C$)</th>
                <th className="py-4 px-6 text-center">Margen %</th>
                <th className="py-4 px-6 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="text-xs text-on-surface divide-y divide-outline-variant/20">
              {categories.map((item, index) => (
                <tr key={index} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-on-surface">{item.category}</td>
                  <td className="py-4 px-6 text-right font-bold text-tertiary">{formatCurrency(item.revenue)}</td>
                  <td className="py-4 px-6 text-right text-on-surface-variant">{formatCurrency(item.expenses)}</td>
                  <td className="py-4 px-6 text-center font-bold">{item.margin}%</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                      item.status === 'Excelente'
                        ? 'bg-tertiary-container/20 text-tertiary'
                        : 'bg-primary-container/20 text-primary'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
