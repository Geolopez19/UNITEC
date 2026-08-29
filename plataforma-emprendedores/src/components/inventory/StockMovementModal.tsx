import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: {
    id: string;
    name: string;
    stock_quantity: number;
  } | null;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const [type, setType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;

      const qty = Number(quantity);
      const newStock = type === 'in' ? product.stock_quantity + qty : Math.max(0, product.stock_quantity - qty);

      // Save movement
      if (!product.id.startsWith('demo-')) {
        await (supabase.from('inventory_movements') as any).insert({
          user_id: userId,
          item_id: product.id,
          type,
          quantity: qty,
          notes,
        });

        // Update item stock
        await (supabase.from('inventory_items') as any)
          .update({ stock_quantity: newStock })
          .eq('id', product.id);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving movement:', err);
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-md w-full shadow-level-2 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-tertiary">
              Movimiento de Stock
            </span>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              {product.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setType('in')}
              className={`flex-1 py-2 font-bold rounded-lg transition-colors cursor-pointer ${
                type === 'in' ? 'bg-tertiary text-on-tertiary shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              📥 Entrada (Restock)
            </button>
            <button
              type="button"
              onClick={() => setType('out')}
              className={`flex-1 py-2 font-bold rounded-lg transition-colors cursor-pointer ${
                type === 'out' ? 'bg-error text-on-error shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              📤 Salida (Venta/Merma)
            </button>
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Cantidad a Modificar</label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface font-bold text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Nota u Observación (Opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Reabastecimiento semanal de proveedor"
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl text-on-surface-variant flex justify-between items-center font-semibold">
            <span>Stock resultante estimado:</span>
            <span className="font-bold text-on-surface text-sm">
              {type === 'in' ? product.stock_quantity + Number(quantity) : Math.max(0, product.stock_quantity - Number(quantity))} unidades
            </span>
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
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-on-primary-fixed-variant shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Confirmar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
