import React, { useEffect, useState } from 'react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCustomer?: any) => void;
  initialData?: any;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [name, setName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [tier, setTier] = useState<string>('Nivel Oro');
  const [totalSpent, setTotalSpent] = useState<number>(0);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCompany(initialData.company || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setTier(initialData.tier || 'Nivel Oro');
      setTotalSpent(initialData.totalSpent || 0);
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setTier('Nivel Oro');
      setTotalSpent(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const customerObj = {
      id: initialData?.id || `cli-${Date.now()}`,
      name: name || 'Cliente Nuevo',
      company: company || 'Negocio Independiente',
      email: email || 'cliente@correo.com',
      phone: phone || '+505 8888-8888',
      lastPurchase: 'Hoy',
      totalSpent: Number(totalSpent) || 0,
      status: 'Cliente Activo',
      tier,
    };

    onSuccess(customerObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-lg w-full shadow-level-2 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-primary">
              Gestión de Clientes & CRM
            </span>
            <h3 className="font-headline text-xl font-bold text-on-surface">
              {initialData ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. María Gómez"
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Empresa o Nombre del Negocio</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ej. Distribuidora del Norte"
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@distribuidora.com"
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Teléfono de Contacto</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+505 8888-5678"
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Nivel de Lealtad</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface font-semibold focus:outline-none focus:border-primary"
              >
                <option value="Nivel Plata">Nivel Plata</option>
                <option value="Nivel Oro">Nivel Oro</option>
                <option value="Nivel Platino">Nivel Platino ⭐</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Compras Historicas (C$)</label>
              <input
                type="number"
                min={0}
                value={totalSpent}
                onChange={(e) => setTotalSpent(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface font-semibold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-outline text-on-surface hover:bg-surface-container-high cursor-pointer font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-on-primary-fixed-variant shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Guardar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
