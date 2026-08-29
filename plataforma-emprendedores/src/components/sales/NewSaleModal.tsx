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

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState<string>('Cliente de Ventanilla');
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await (supabase.from('inventory_items') as any).select('id, name, selling_price, stock_quantity');
        if (data && data.length > 0) {
          setAvailableProducts(data);
          setSelectedProductId(data[0].id);
        } else {
          // Fallback sample products
          const sample = [
            { id: 'demo-1', name: 'Silla Ergonómica Pro Black', selling_price: 245.00, stock_quantity: 142 },
            { id: 'demo-2', name: 'Teclado Inalámbrico K2 Slim', selling_price: 45.50, stock_quantity: 12 },
            { id: 'demo-3', name: 'Cafetera Espresso Barista Pro', selling_price: 899.00, stock_quantity: 45 },
          ];
          setAvailableProducts(sample);
          setSelectedProductId(sample[0].id);
        }
      } catch (err) {
        console.error('Error loading inventory products for sale:', err);
      }
    };

    if (isOpen) {
      fetchProducts();
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
      const userId = userRes.data.user?.id;

      if (userId) {
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

          // Discount inventory stock
          const newQty = Math.max(0, currentProduct.stock_quantity - Number(quantity));
          await (supabase.from('inventory_items') as any)
            .update({ stock_quantity: newQty })
            .eq('id', currentProduct.id);
        }
      }
    } catch (err) {
      console.error('Error saving sale in Supabase:', err);
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
            <label className="block font-bold text-on-surface mb-1">Nombre del Cliente / Razón Social</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. María Jiménez"
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Producto a Vender</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary font-semibold text-xs"
            >
              {availableProducts.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} — {formatCurrency(prod.selling_price)} (Stock: {prod.stock_quantity})
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
