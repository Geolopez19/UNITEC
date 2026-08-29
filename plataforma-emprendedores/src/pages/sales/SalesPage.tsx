import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { NewSaleModal } from '../../components/sales/NewSaleModal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../utils/currency';

interface SaleTransaction {
  id: string;
  date: string;
  customer: string;
  amount: number;
  status: 'Completado' | 'Procesando' | 'Pendiente' | 'Cancelado';
  paymentMethod?: string;
}

const SAMPLE_TRANSACTIONS: SaleTransaction[] = [
  {
    id: '#ORD-9932',
    date: '24 Oct, 14:30',
    customer: 'María Jiménez',
    amount: 1250.00,
    status: 'Completado',
  },
  {
    id: '#ORD-9931',
    date: '24 Oct, 11:15',
    customer: 'Carlos Ruiz',
    amount: 450.50,
    status: 'Procesando',
  },
  {
    id: '#ORD-9930',
    date: '23 Oct, 16:45',
    customer: 'Empresa ABC S.A.',
    amount: 3800.00,
    status: 'Pendiente',
  },
  {
    id: '#ORD-9929',
    date: '23 Oct, 09:20',
    customer: 'Laura Torres',
    amount: 125.00,
    status: 'Cancelado',
  },
  {
    id: '#ORD-9928',
    date: '22 Oct, 14:10',
    customer: 'Jorge Pérez',
    amount: 890.00,
    status: 'Completado',
  },
];

export const SalesPage: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<SaleTransaction[]>(SAMPLE_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState<boolean>(false);

  const getStorageKey = () => `rutapyme_sales_${user?.id || 'guest'}`;

  const loadLocalSales = (): SaleTransaction[] => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalSales = (list: SaleTransaction[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSales = async () => {
    const local = loadLocalSales();

    try {
      if (user) {
        const { data, error } = await (supabase.from('invoices') as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: SaleTransaction[] = data.map((inv: any) => ({
            id: inv.invoice_number || `#ORD-${inv.id.substring(0, 4)}`,
            date: new Date(inv.created_at || Date.now()).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            customer: inv.notes ? inv.notes.split('Cliente: ')[1] || 'Cliente General' : 'Cliente General',
            amount: Number(inv.total_amount) || 0,
            status: inv.status === 'paid' ? 'Completado' : inv.status === 'issued' ? 'Procesando' : 'Pendiente',
          }));

          // Merge local
          local.forEach((loc) => {
            if (!mapped.some((m) => m.id === loc.id)) {
              mapped.unshift(loc);
            }
          });

          setSales(mapped);
          return;
        }
      }

      if (local.length > 0) {
        setSales(local);
      } else {
        setSales(SAMPLE_TRANSACTIONS);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setSales(local.length > 0 ? local : SAMPLE_TRANSACTIONS);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [user]);

  const handleSaleSuccess = (newSale?: SaleTransaction) => {
    if (newSale) {
      setSales((prev) => {
        const updated = [newSale, ...prev];
        saveLocalSales(updated);
        return updated;
      });
    }
    fetchSales();
  };

  // KPI Computations
  const totalRevenue = sales.reduce((acc, s) => (s.status !== 'Cancelado' ? acc + s.amount : acc), 0);
  const totalOrders = sales.filter((s) => s.status !== 'Cancelado').length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const completedCount = sales.filter((s) => s.status === 'Completado').length;
  const processingCount = sales.filter((s) => s.status === 'Procesando').length;
  const pendingCount = sales.filter((s) => s.status === 'Pendiente').length;

  const filteredSales = sales.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout title="Ventas - RutaPyme">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            Historial de Ventas
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Monitorea y analiza el rendimiento de tus transacciones y emisión de facturas.
          </p>
        </div>

        <button
          onClick={() => setIsNewSaleModalOpen(true)}
          className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nueva Venta
        </button>
      </div>

      {/* Metrics Summary Cards (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Ingresos Totales */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-primary-container/20 rounded-xl text-primary font-bold">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <span className="text-xs font-bold text-tertiary flex items-center gap-1 bg-tertiary-container/10 px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-xs">trending_up</span> +12.5% vs mes anterior
            </span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Ingresos Totales (Mes)</p>
            <h3 className="font-headline text-3xl font-bold text-on-surface">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        {/* Card 2: Número de Pedidos */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-tertiary-container/20 rounded-xl text-tertiary font-bold">
              <span className="material-symbols-outlined text-xl">shopping_cart</span>
            </div>
            <span className="text-xs font-bold text-tertiary flex items-center gap-1 bg-tertiary-container/10 px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-xs">trending_up</span> +4.2% pedidos
            </span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Número de Pedidos</p>
            <h3 className="font-headline text-3xl font-bold text-on-surface">{totalOrders.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 3: Ticket Promedio */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-secondary-container rounded-xl text-secondary font-bold">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-full">
              Promedio por factura
            </span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-1">Ticket Promedio</p>
            <h3 className="font-headline text-3xl font-bold text-on-surface">{formatCurrency(averageTicket)}</h3>
          </div>
        </div>
      </div>

      {/* Charts & Status Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Trend Chart (Clean SVG Chart) */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Tendencia de Ingresos</h3>
              <p className="text-xs text-on-surface-variant">Evolución de ventas de los últimos 30 días</p>
            </div>
            <span className="px-3 py-1 bg-surface-container-high text-xs font-bold text-primary rounded-lg">
              Últimos 30 días
            </span>
          </div>

          <div className="w-full h-48 flex items-end justify-between gap-3 pt-6 border-b border-outline-variant/30 px-2">
            {[
              { day: '1 Oct', val: 30 },
              { day: '5 Oct', val: 55 },
              { day: '10 Oct', val: 40 },
              { day: '15 Oct', val: 75 },
              { day: '20 Oct', val: 60 },
              { day: '25 Oct', val: 90 },
              { day: '30 Oct', val: 80 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                <div
                  style={{ height: `${bar.val}%` }}
                  className="w-full bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-300 relative"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {bar.val * 300} C$
                  </div>
                </div>
                <span className="text-[10px] text-on-surface-variant font-bold">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-level-1 border border-outline-variant/20 flex flex-col justify-between">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-6">Estado de Órdenes</h3>
          
          <div className="space-y-5 flex-1">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-2 text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                  Completadas
                </span>
                <span className="text-tertiary">{completedCount}</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-tertiary h-full rounded-full transition-all duration-500"
                  style={{ width: `${sales.length > 0 ? (completedCount / sales.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-2 text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  Procesando
                </span>
                <span className="text-primary">{processingCount}</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${sales.length > 0 ? (processingCount / sales.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-2 text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  Pendientes
                </span>
                <span className="text-secondary">{pendingCount}</span>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full transition-all duration-500"
                  style={{ width: `${sales.length > 0 ? (pendingCount / sales.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden border border-outline-variant/20">
        
        {/* Table Filters */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">Transacciones Recientes</h3>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ID u orden..."
                className="w-full pl-9 pr-4 py-2 border border-outline-variant/50 rounded-xl text-xs bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-outline-variant text-xs bg-background font-semibold text-on-surface"
            >
              <option value="all">Todos los Estados</option>
              <option value="Completado">Completado</option>
              <option value="Procesando">Procesando</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs border-b border-outline-variant/30 uppercase tracking-wider font-bold">
                <th className="py-4 px-6">ID Orden</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6 text-right">Monto (C$)</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="text-xs text-on-surface divide-y divide-outline-variant/20">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant italic">
                    No se encontraron transacciones registradas.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  let badgeStyle = 'bg-surface-container-high text-on-surface-variant';
                  if (sale.status === 'Completado') badgeStyle = 'bg-tertiary-container/20 text-tertiary font-bold';
                  if (sale.status === 'Procesando') badgeStyle = 'bg-primary-container/20 text-primary font-bold';
                  if (sale.status === 'Pendiente') badgeStyle = 'bg-amber-500/10 text-amber-700 font-bold';
                  if (sale.status === 'Cancelado') badgeStyle = 'bg-error-container text-on-error-container font-bold';

                  const initials = sale.customer
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={sale.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-on-surface font-mono">{sale.id}</td>
                      <td className="py-4 px-6 text-on-surface-variant">{sale.date}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary font-bold flex items-center justify-center text-xs">
                            {initials || 'CL'}
                          </div>
                          <span className="font-semibold text-on-surface">{sale.customer}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-sm">{formatCurrency(sale.amount)}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] ${badgeStyle}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => alert(`Detalles de la factura ${sale.id} para ${sale.customer}`)}
                          className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-surface-container-high"
                          title="Ver Detalle"
                        >
                          <span className="material-symbols-outlined text-base">receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSuccess={handleSaleSuccess}
      />
    </DashboardLayout>
  );
};
