import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem?: any) => void;
  initialData?: any;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [name, setName] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStockLevel, setMinStockLevel] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSku(initialData.sku || '');
      setCategory(initialData.category || 'General');
      setCostPrice(initialData.cost_price || 0);
      setSellingPrice(initialData.selling_price || 0);
      setStockQuantity(initialData.stock_quantity || 0);
      setMinStockLevel(initialData.min_stock_level || 5);
    } else {
      setName('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory('General');
      setCostPrice(0);
      setSellingPrice(0);
      setStockQuantity(10);
      setMinStockLevel(5);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const generatedId = initialData?.id || `item-${Date.now()}`;

    const itemObj = {
      id: generatedId,
      name: name || 'Producto Sin Nombre',
      sku: sku || `SKU-${Date.now()}`,
      category: category || 'General',
      cost_price: Number(costPrice) || 0,
      selling_price: Number(sellingPrice) || 0,
      stock_quantity: Number(stockQuantity) || 0,
      min_stock_level: Number(minStockLevel) || 5,
      max_stock_target: Math.max(100, Number(stockQuantity) * 2),
    };

    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;

      if (userId) {
        const payload = {
          name: itemObj.name,
          sku: itemObj.sku,
          category: itemObj.category,
          cost_price: itemObj.cost_price,
          selling_price: itemObj.selling_price,
          stock_quantity: itemObj.stock_quantity,
          min_stock_level: itemObj.min_stock_level,
          user_id: userId,
        };

        if (initialData?.id && !initialData.id.startsWith('demo-') && !initialData.id.startsWith('item-')) {
          await (supabase.from('inventory_items') as any)
            .update(payload)
            .eq('id', initialData.id);
        } else {
          const { data: insertedData } = await (supabase.from('inventory_items') as any)
            .insert(payload)
            .select()
            .single();

          if (insertedData) {
            itemObj.id = insertedData.id;
          }
        }
      }
    } catch (err) {
      console.error('Error syncing product to Supabase:', err);
    } finally {
      setLoading(false);
      onSuccess(itemObj);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-lg w-full shadow-level-2 overflow-hidden flex flex-col">
        
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-primary">
              Gestión de Inventario
            </span>
            <h3 className="font-headline text-xl font-bold text-on-surface">
              {initialData ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="m-6 p-3 bg-error-container text-on-error-container text-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-on-surface mb-1">Nombre del Producto</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Silla Ergonómica Pro"
              className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">SKU / Código</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Muebles">Muebles</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Electrodomésticos">Electrodomésticos</option>
                <option value="Papelería">Papelería</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Precio de Costo (C$)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Precio de Venta (C$)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Stock Actual (Unidades)</label>
              <input
                type="number"
                min={0}
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Stock Mínimo (Alerta)</label>
              <input
                type="number"
                min={1}
                required
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-outline-variant bg-background text-on-surface focus:outline-none focus:border-primary"
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
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-on-primary-fixed-variant shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
