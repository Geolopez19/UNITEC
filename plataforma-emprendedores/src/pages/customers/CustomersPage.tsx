import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CustomerModal } from '../../components/customers/CustomerModal';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  lastPurchase: string;
  totalSpent: number;
  status: 'Cliente Activo' | 'Inactivo reciente';
  tier: 'Nivel Plata' | 'Nivel Oro' | 'Nivel Platino';
  avatarUrl?: string;
}

const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'cli-1',
    name: 'María Gómez',
    company: 'Distribuidora del Norte',
    email: 'maria.g@distribuidora.com',
    phone: '+505 8888-5678',
    lastPurchase: 'Hace 2 días',
    totalSpent: 45200.00,
    status: 'Cliente Activo',
    tier: 'Nivel Oro',
  },
  {
    id: 'cli-2',
    name: 'Carlos Ruiz',
    company: 'Abarrotes La Esquina',
    email: 'carlos@abarrotesesquina.com',
    phone: '+505 8765-4321',
    lastPurchase: 'Hace 1 semana',
    totalSpent: 12850.00,
    status: 'Inactivo reciente',
    tier: 'Nivel Plata',
  },
  {
    id: 'cli-3',
    name: 'Luis Fernando',
    company: 'Supermercados LF',
    email: 'contacto@superlf.com',
    phone: '+505 8468-1357',
    lastPurchase: 'Hoy',
    totalSpent: 128400.00,
    status: 'Cliente Activo',
    tier: 'Nivel Platino',
  },
];

export const CustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(SAMPLE_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const getStorageKey = () => `rutapyme_customers_${user?.id || 'guest'}`;

  const loadLocalCustomers = (): Customer[] => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalCustomers = (list: Customer[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const local = loadLocalCustomers();
    if (local.length > 0) {
      setCustomers(local);
    } else {
      setCustomers(SAMPLE_CUSTOMERS);
    }
  }, [user]);

  const handleCustomerSuccess = (newCust?: any) => {
    if (newCust) {
      setCustomers((prev) => {
        const exists = prev.some((c) => c.id === newCust.id);
        let updated: Customer[];
        if (exists) {
          updated = prev.map((c) => (c.id === newCust.id ? { ...c, ...newCust } : c));
        } else {
          updated = [newCust, ...prev];
        }
        saveLocalCustomers(updated);
        return updated;
      });
    }
  };

  const handleDeleteCustomer = (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    setCustomers((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveLocalCustomers(updated);
      return updated;
    });
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'frecuentes') return matchesSearch && c.tier === 'Nivel Platino';
    if (activeFilter === 'recientes') return matchesSearch && c.lastPurchase === 'Hoy';
    return matchesSearch;
  });

  return (
    <DashboardLayout title="Clientes - RutaPyme">
      {/* Page Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            Directorio de Clientes
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Gestiona tu cartera de clientes, niveles de lealtad e historial de compras.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, empresa o correo..."
              className="w-full pl-9 pr-4 py-2 border border-outline-variant/50 rounded-xl text-xs bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsCustomerModalOpen(true);
            }}
            className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-on-primary-fixed-variant transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
          }`}
        >
          Todos ({customers.length})
        </button>
        <button
          onClick={() => setActiveFilter('frecuentes')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            activeFilter === 'frecuentes'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
          }`}
        >
          Frecuentes ⭐
        </button>
        <button
          onClick={() => setActiveFilter('recientes')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            activeFilter === 'recientes'
              ? 'bg-primary-container text-on-primary-container shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-low'
          }`}
        >
          Compras Recientes
        </button>
      </div>

      {/* Bento Grid Layout for Customers */}
      {filteredCustomers.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-on-surface-variant italic text-sm">
          No se encontraron clientes en el directorio.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((cust) => {
            const initials = cust.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            const isActive = cust.status === 'Cliente Activo';

            return (
              <div
                key={cust.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Header Card */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-primary-container/20 border border-outline-variant flex items-center justify-center text-primary font-headline text-lg font-bold">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                          {cust.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm">storefront</span>
                          {cust.company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCustomer(cust);
                          setIsCustomerModalOpen(true);
                        }}
                        className="p-1 text-on-surface-variant hover:text-primary cursor-pointer rounded-lg hover:bg-surface-container-high transition-colors"
                        title="Editar Cliente"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(cust.id)}
                        className="p-1 text-on-surface-variant hover:text-error cursor-pointer rounded-lg hover:bg-error-container/30 transition-colors"
                        title="Eliminar Cliente"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-5 text-xs text-on-surface-variant font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-base">mail</span>
                      <span>{cust.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline text-base">call</span>
                      <span>{cust.phone}</span>
                    </div>
                  </div>

                  {/* Stats Box */}
                  <div className="bg-surface-container-low rounded-xl p-3.5 grid grid-cols-2 gap-4 border border-outline-variant/30">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant mb-0.5">Última Compra</p>
                      <p className="text-xs font-bold text-on-surface">{cust.lastPurchase}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant mb-0.5">Valor Total</p>
                      <p className="text-xs font-bold text-tertiary">{formatCurrency(cust.totalSpent)}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Badge & Tier */}
                <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-tertiary' : 'bg-secondary'}`}></span>
                    <span className={isActive ? 'text-tertiary' : 'text-secondary'}>{cust.status}</span>
                  </div>

                  <span className="px-2.5 py-1 bg-surface-container-high text-primary font-bold text-[11px] rounded-lg flex items-center gap-1">
                    {cust.tier === 'Nivel Platino' && (
                      <span className="material-symbols-outlined text-xs">star</span>
                    )}
                    {cust.tier}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={handleCustomerSuccess}
        initialData={editingCustomer}
      />
    </DashboardLayout>
  );
};
