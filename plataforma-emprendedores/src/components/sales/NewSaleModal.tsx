import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../utils/currency';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newSale?: any) => void;
}

interface ProductItem {
  id: string;
  name: string;
  selling_price: number;
  stock_quantity: number;
}

interface CustomerOption {
  id: string;
  name: string;
  company: string;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState<string>('María Gómez');
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadInventoryAndCustomers = async () => {
      try {
        const userRes = await supabase.auth.getUser();
        const userId = userRes.data.user?.id || 'guest';

        // 1. Load Inventory Products (Local + Supabase)
        const invKey = `rutapyme_inventory_${userId}`;
        let localInv: ProductItem[] = [];
        try {
          const stored = localStorage.getItem(invKey);
          if (stored) localInv = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }

        const { data: supaInv } = await (supabase.from('inventory_items') as any).select('id, name, selling_price, stock_quantity');
        let combinedInv: ProductItem[] = supaInv && supaInv.length > 0 ? supaInv : [];
        
        localInv.forEach((loc) => {
          if (!combinedInv.some((c) => c.id === loc.id)) {
            combinedInv.push(loc);
          }
        });

        if (combinedInv.length === 0) {
          combinedInv = [
            { id: 'demo-1', name: 'Silla Ergonómica Pro Black', selling_price: 245.00, stock_quantity: 142 },
            { id: 'demo-2', name: 'Teclado Inalámbrico K2 Slim', selling_price: 45.50, stock_quantity: 12 },
            { id: 'demo-3', name: 'Cafetera Espresso Barista Pro', selling_price: 899.00, stock_quantity: 45 },
          ];
        }

        setAvailableProducts(combinedInv);
        if (combinedInv.length > 0) setSelectedProductId(combinedInv[0].id);

        // 2. Load Customers (Local + Sample)
        const custKey = `rutapyme_customers_${userId}`;
        let localCust: CustomerOption[] = [];
        try {
          const storedCust = localStorage.getItem(custKey);
          if (storedCust) localCust = JSON.parse(storedCust);
        } catch (e) {
          console.error(e);
        }

        if (localCust.length === 0) {
          localCust = [
            { id: 'cli-1', name: 'María Gómez', company: 'Distribuidora del Norte' },
            { id: 'cli-2', name: 'Carlos Ruiz', company: 'Abarrotes La Esquina' },
            { id: 'cli-3', name: 'Luis Fernando', company: 'Supermercados LF' },
          ];
        }
        setAvailableCustomers(localCust);
        if (localCust.length > 0) setCustomerName(localCust[0].name);

      } catch (err) {
        console.error('Error loading data for new sale modal:', err);
      }
    };

    if (isOpen) {
      loadInventoryAndCustomers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProduct = availableProducts.find((p) => p.id === selectedProductId) || availableProducts[0];
  const unitPrice = currentProduct?.selling_price || 0;
  const subtotal = unitPrice * Math.max(1, Number(quantity));
  const tax = subtotal * 0.15; // 15% ISV
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const saleObj = {
      id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('es-NI', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      customer: customerName || 'Cliente General',
      amount: total,
      status: 'Completado',
      paymentMethod,
    };

    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id || 'guest';

      // 1. Discount stock in LocalStorage
      const invKey = `rutapyme_inventory_${userId}`;
      try {
        const stored = localStorage.getItem(invKey);
        if (stored) {
          const invList = JSON.parse(stored);
          const updatedInv = invList.map((item: any) => {
            if (item.id === selectedProductId) {
              return { ...item, stock_quantity: Math.max(0, item.stock_quantity - Number(quantity)) };
            }
            return item;
          });
          localStorage.setItem(invKey, JSON.stringify(updatedInv));
        }
      } catch (e) {
        console.error(e);
      }

      // 2. Update Customer Total Spent in LocalStorage
      const custKey = `rutapyme_customers_${userId}`;
      try {
        const storedCust = localStorage.getItem(custKey);
        if (storedCust) {
          const custFilter = JSON.parse(storedCust);
          const updatedCust = custFilter.map((c: any) => {
            if (c.name.toLowerCase() === customerName.toLowerCase()) {
              return {
                ...c,
                totalSpent: (c.totalSpent || 0) + total,
                lastPurchase: 'Hoy',
                status: 'Cliente Activo',
              };
            }
            return c;
          });
          localStorage.setItem(custKey, JSON.stringify(updatedCust));
        }
      } catch (e) {
        console.error(e);
      }

      // 3. Supabase Sync if authenticated
      if (userId !== 'guest') {
        const { data: invData } = await (supabase.from('invoices') as any)
          .insert({
            user_id: userId,
            invoice_number: saleObj.id,
            subtotal,
            tax_amount: tax,
            total_amount: total,
            status: 'paid',
            notes: `Pago vía ${paymentMethod}. Cliente: ${customerName}`,
          })
          .select()
          .single();

        if (invData && currentProduct && !currentProduct.id.startsWith('demo-')) {
          await (supabase.from('invoice_items') as any).insert({
            invoice_id: invData.id,
            item_id: currentProduct.id,
            description: currentProduct.name,
            quantity: Number(quantity),
            unit_price: unitPrice,
            total_price: subtotal,
          });

          const newQty = Math.max(0, currentProduct.stock_quantity - Number(quantity));
          await (supabase.from('inventory_items') as any)
            .update({ stock_quantity: newQty })
            .eq('id', currentProduct.id);
        }
      }
    } catch (err) {
      console.error('Error saving sale:', err);
    } finally {
      setLoading(false);
      onSuccess(saleObj);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-lg w-full shadow-level-2 overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-tertiary">
              Facturación & Ventas
            </span>
            <h3 className="font-headline text-xl font-bold text-on-surface">
              Registrar Nueva Venta
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Cliente / Razon Social</label>
            <select
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary font-semibold text-xs mb-2"
            >
              {availableCustomers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} — ({c.company})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="O escribe nombre de cliente no registrado..."
              className="w-full p-2.5 rounded-xl border border-outline-variant/60 bg-background text-on-surface focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Producto a Vender (del Inventario)</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary font-semibold text-xs"
            >
              {availableProducts.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} — {formatCurrency(prod.selling_price)} (Stock actual: {prod.stock_quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                max={currentProduct?.stock_quantity || 999}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface font-bold text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Forma de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary font-semibold text-xs"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="Crédito 30 días">Crédito 30 días</option>
              </select>
            </div>
          </div>

          {/* Breakdown Summary Box */}
          <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-2 text-on-surface-variant font-semibold">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-on-surface">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Impuestos (15% ISV):</span>
              <span className="text-on-surface">{formatCurrency(tax)}</span>
            </div>
            <div className="pt-2 border-t border-outline-variant/30 flex justify-between font-headline font-bold text-base text-primary">
              <span>Total a Cobrar:</span>
              <span>{formatCurrency(total)}</span>
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
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-tertiary text-on-tertiary font-bold hover:bg-tertiary-container shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>{loading ? 'Emitiendo...' : 'Emitir Venta & Factura'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
