import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ProductModal } from '../../components/inventory/ProductModal';
import { StockMovementModal } from '../../components/inventory/StockMovementModal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_target?: number;
}

const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: 'demo-1',
    name: 'Silla Ergonómica Pro Black',
    sku: 'FUR-001-BLK',
    category: 'Muebles',
    cost_price: 150.00,
    selling_price: 245.00,
    stock_quantity: 142,
    min_stock_level: 20,
    max_stock_target: 200,
  },
  {
    id: 'demo-2',
    name: 'Teclado Inalámbrico K2 Slim',
    sku: 'ELE-KB-002',
    category: 'Electrónica',
    cost_price: 25.00,
    selling_price: 45.50,
    stock_quantity: 12,
    min_stock_level: 20,
    max_stock_target: 100,
  },
  {
    id: 'demo-3',
    name: 'Cafetera Espresso Barista Pro',
    sku: 'APP-CF-100',
    category: 'Electrodomésticos',
    cost_price: 550.00,
    selling_price: 899.00,
    stock_quantity: 45,
    min_stock_level: 10,
    max_stock_target: 50,
  },
];

export const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>(SAMPLE_INVENTORY);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState<boolean>(false);
  const [movementProduct, setMovementProduct] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    try {
      if (user) {
        const { data, error } = await (supabase.from('inventory_items') as any)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setItems(data);
          return;
        }
      }
      setItems(SAMPLE_INVENTORY);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setItems(SAMPLE_INVENTORY);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const handleDeleteItem = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto del inventario?')) return;

    if (!id.startsWith('demo-')) {
      await (supabase.from('inventory_items') as any).delete().eq('id', id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // KPI Computations
  const totalProducts = items.length;
  const lowStockAlerts = items.filter((i) => i.stock_quantity <= i.min_stock_level).length;
  const totalValue = items.reduce((acc, i) => acc + i.stock_quantity * i.selling_price, 0);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout title="Inventario - RutaPyme">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            Gestión de Inventario
          </h1>
          <p className="text-sm text-on-surface-variant">
            Control de productos, stock mínimo, alertas de reabastecimiento y valor total del inventario.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          className="px-5 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Agregar Producto
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Products */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body-md text-sm font-semibold text-on-surface-variant">Total Productos</h3>
            <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-xl text-xl">
              inventory_2
            </span>
          </div>
          <p className="font-headline text-3xl font-bold text-on-surface">{totalProducts.toLocaleString()}</p>
          <div className="mt-2 flex items-center text-tertiary font-bold text-xs">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="ml-1">+12% vs mes anterior</span>
          </div>
        </div>

        {/* Card 2: Low Stock Alerts */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body-md text-sm font-semibold text-on-surface-variant">Alertas de Stock Bajo</h3>
            <span className="material-symbols-outlined text-tertiary bg-tertiary-container text-on-tertiary p-2 rounded-xl text-xl">
              warning
            </span>
          </div>
          <p className="font-headline text-3xl font-bold text-on-surface">{lowStockAlerts}</p>
          <div className="mt-2 text-on-surface-variant text-xs font-semibold">
            <span>Ítems por debajo del stock mínimo</span>
          </div>
        </div>

        {/* Card 3: Total Value */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-level-1 border border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body-md text-sm font-semibold text-on-surface-variant">Valor Total de Inventario</h3>
            <span className="material-symbols-outlined text-primary bg-surface-container-high p-2 rounded-xl text-xl">
              payments
            </span>
          </div>
          <p className="font-headline text-3xl font-bold text-on-surface">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <div className="mt-2 flex items-center text-tertiary font-bold text-xs">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span className="ml-1">+5.2% valor proyectado</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-level-1 overflow-hidden border border-outline-variant/20 space-y-4">
        
        {/* Table Filters & Actions */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-headline text-lg font-bold text-on-surface">Inventario Actual</h3>
          
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por producto o SKU..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/50 focus:border-primary text-xs bg-background text-on-surface"
              />
            </div>

            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-outline-variant text-xs bg-background font-semibold text-on-surface"
            >
              <option value="all">Todas las Categorías</option>
              <option value="Muebles">Muebles</option>
              <option value="Electrónica">Electrónica</option>
              <option value="Electrodomésticos">Electrodomésticos</option>
              <option value="Papelería">Papelería</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs border-b border-outline-variant/30 uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Producto</th>
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6">SKU</th>
                <th className="py-4 px-6 text-right">Precio Venta</th>
                <th className="py-4 px-6">Estado de Stock</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-xs text-on-surface divide-y divide-outline-variant/20">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant italic">
                    No se encontraron productos en el inventario.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = item.stock_quantity <= item.min_stock_level;
                  const maxTarget = item.max_stock_target || 100;
                  const stockPercentage = Math.min(100, Math.round((item.stock_quantity / maxTarget) * 100));

                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                            isLowStock ? 'bg-amber-500/10 text-amber-600' : 'bg-primary-container text-on-primary-container'
                          }`}>
                            <span className="material-symbols-outlined">
                              {isLowStock ? 'warning' : 'inventory_2'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-on-surface">{item.name}</p>
                            <p className="text-on-surface-variant text-[11px]">Costo: ${item.cost_price.toFixed(2)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold">{item.category}</td>
                      <td className="py-4 px-6 text-on-surface-variant font-mono">{item.sku}</td>
                      <td className="py-4 px-6 text-right font-bold text-sm">${item.selling_price.toFixed(2)}</td>

                      <td className="py-4 px-6 min-w-[180px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px] font-semibold">
                            {isLowStock ? (
                              <span className="text-amber-600 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">warning</span>
                                {item.stock_quantity} unidades (Bajo)
                              </span>
                            ) : (
                              <span className="text-on-surface font-semibold">
                                {item.stock_quantity} unidades
                              </span>
                            )}
                            <span className="text-outline">Mín: {item.min_stock_level}</span>
                          </div>

                          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isLowStock ? 'bg-amber-500' : 'bg-primary'
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setMovementProduct(item);
                              setIsMovementModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-tertiary-container text-on-tertiary rounded-lg font-bold text-[11px] hover:bg-tertiary transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                            title="Restock / Ajuste"
                          >
                            <span className="material-symbols-outlined text-sm">add_box</span>
                            Restock
                          </button>

                          <button
                            onClick={() => {
                              setEditingProduct(item);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-surface-container-high"
                            title="Editar Producto"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-on-surface-variant hover:text-error transition-colors cursor-pointer rounded-lg hover:bg-error-container/40"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={fetchInventory}
        initialData={editingProduct}
      />

      {/* Stock Movement Modal */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={fetchInventory}
        product={movementProduct}
      />
    </DashboardLayout>
  );
};
