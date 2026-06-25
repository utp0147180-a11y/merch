import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Save,
  Package,
  AlertTriangle,
  Check,
  ImageIcon,
  ChevronDown,
} from 'lucide-react';
import { Product, ProductVariant, VARIANT_OPTIONS, CATEGORY_TYPE_CONFIGS } from '../../types';

type ProductStatus = 'all' | 'active' | 'draft' | 'out_of_stock';
type SortOption = 'newest' | 'oldest' | 'price_high' | 'price_low' | 'stock_low';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  original_price: string;
  image: string;
  category: string;
  category_type: string;
  brand: string;
  sku: string;
  badge: string;
  rating: string;
  reviews: string;
  is_new: boolean;
  is_sale: boolean;
  featured: boolean;
  active: boolean;
  stock: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  original_price: '',
  image: '',
  category: '',
  category_type: 'clothing',
  brand: '',
  sku: '',
  badge: '',
  rating: '4.5',
  reviews: '0',
  is_new: false,
  is_sale: false,
  featured: false,
  active: true,
  stock: '0',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Form state
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  // Variants management
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
  const [newVariant, setNewVariant] = useState({
    color: '',
    size: '',
    stock: 0,
    sku: '',
  });

  const categories = ['Ropa', 'Belleza', 'Accesorios', 'Calzado'];

  const fetchProducts = async () => {
    setLoading(true);
    const { data: productsData, error } = await supabase
      .from('products')
      .select(`*, product_variants (*)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
      return;
    }

    setProducts(productsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    // Status filter
    switch (statusFilter) {
      case 'active':
        list = list.filter((p) => p.active === true);
        break;
      case 'draft':
        list = list.filter((p) => p.active === false);
        break;
      case 'out_of_stock':
        list = list.filter((p) => {
          const totalStock =
            p.product_variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          return totalStock === 0;
        });
        break;
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case 'oldest':
        list.sort(
          (a, b) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        break;
      case 'price_high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'price_low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'stock_low':
        list.sort((a, b) => {
          const stockA =
            a.product_variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          const stockB =
            b.product_variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
          return stockA - stockB;
        });
        break;
    }

    return list;
  }, [products, searchQuery, statusFilter, sortBy]);

  // Get total stock for a product
  const getTotalStock = (product: Product) => {
    return (
      product.product_variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ||
      product.stock ||
      0
    );
  };

  // Check if product is low stock
  const isLowStock = (product: Product) => {
    const stock = getTotalStock(product);
    return stock > 0 && stock <= 5;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setVariants([]);
    setNewVariant({ color: '', size: '', stock: 0, sku: '' });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      original_price: String(product.original_price || ''),
      image: product.image || '',
      category: product.category || '',
      category_type: product.category_type || 'clothing',
      brand: product.brand || '',
      sku: product.sku || '',
      badge: product.badge || '',
      rating: String(product.rating || '4.5'),
      reviews: String(product.reviews || '0'),
      is_new: product.is_new || false,
      is_sale: product.is_sale || false,
      featured: product.featured || false,
      active: product.active ?? true,
      stock: String(product.stock || '0'),
    });
    setVariants(product.product_variants || []);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      alert('Error al eliminar producto');
      return;
    }

    fetchProducts();
  };

  const addVariant = () => {
    if (!newVariant.color) return;

    setVariants([...variants, { ...newVariant, active: true } as ProductVariant]);
    setNewVariant({ color: '', size: '', stock: 0, sku: '' });
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const saveProduct = async () => {
    if (!formData.name || !formData.price) {
      alert('Nombre y precio son requeridos');
      return;
    }

    let productId = editing?.id;

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      original_price: formData.original_price ? Number(formData.original_price) : null,
      image: formData.image,
      category: formData.category,
      category_type: formData.category_type,
      brand: formData.brand,
      sku: formData.sku,
      badge: formData.badge || null,
      rating: Number(formData.rating) || 4.5,
      reviews: Number(formData.reviews) || 0,
      is_new: formData.is_new,
      is_sale: formData.is_sale,
      featured: formData.featured,
      active: formData.active,
      stock: Number(formData.stock) || 0,
    };

    if (!editing) {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        alert('Error al crear producto');
        return;
      }

      productId = data.id;
    } else {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editing.id);

      if (error) {
        console.error('Error updating product:', error);
        alert('Error al actualizar producto');
        return;
      }

      // Delete existing variants
      await supabase.from('product_variants').delete().eq('product_id', editing.id);
    }

    // Save variants
    if (variants.length > 0 && productId) {
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(
          variants.map((v) => ({
            product_id: productId,
            color: v.color,
            size: v.size || null,
            stock: v.stock,
            sku: v.sku || null,
            active: true,
          }))
        );

      if (variantError) {
        console.error('Error saving variants:', variantError);
      }
    }

    resetForm();
    fetchProducts();
  };

  // Get available sizes based on category type
  const getAvailableSizes = () => {
    const config = CATEGORY_TYPE_CONFIGS.find((c) => c.type === formData.category_type);
    return config?.sizes || [];
  };

  const getAvailableColors = () => {
    const config = CATEGORY_TYPE_CONFIGS.find((c) => c.type === formData.category_type);
    return config?.colors || VARIANT_OPTIONS.colors;
  };

  return (
    <div className="min-h-screen bg-[#FDF8F4]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8D4C4] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#6B4423]">Productos</h1>
              <p className="text-sm text-[#B89B8A]">
                {products.length} productos en total
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-[#6B4423] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#8B7355] transition-colors"
            >
              <Plus size={18} />
              Nuevo producto
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B89B8A]"
              />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProductStatus)}
              className="px-4 py-2.5 bg-white border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="draft">Borradores</option>
              <option value="out_of_stock">Agotados</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-white border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="price_high">Mayor precio</option>
              <option value="price_low">Menor precio</option>
              <option value="stock_low">Stock bajo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4A59A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8D4C4] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#FDF8F4] border-b border-[#E8D4C4] text-xs font-semibold text-[#8B7355] uppercase tracking-wider">
              <div className="col-span-4">Producto</div>
              <div className="col-span-2">Categoría</div>
              <div className="col-span-2 text-right">Precio</div>
              <div className="col-span-2 text-center">Stock</div>
              <div className="col-span-1 text-center">Estado</div>
              <div className="col-span-1 text-center">Acciones</div>
            </div>

            {/* Product rows */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Package size={48} className="text-[#E8D4C4] mb-4" />
                <p className="text-[#B89B8A] text-lg">No se encontraron productos</p>
                <p className="text-sm text-[#B89B8A] mt-1">
                  Intenta cambiar los filtros o crea un nuevo producto
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const stock = getTotalStock(product);
                const lowStock = isLowStock(product);
                const outOfStock = stock === 0;

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#F5EDE5] hover:bg-[#FDF8F4]/50 transition-colors items-center"
                  >
                    {/* Product info */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FDF8F4] flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={20} className="text-[#E8D4C4]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[#6B4423] line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#B89B8A] mt-0.5">
                          {product.brand || 'Sin marca'}
                        </p>
                        {product.product_variants && product.product_variants.length > 0 && (
                          <p className="text-[10px] text-[#D4A59A] mt-1">
                            {product.product_variants.length} variantes
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                      <span className="text-sm text-[#6B4423]">
                        {product.category || '-'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-right">
                      <p className="font-semibold text-[#6B4423]">
                        ${product.price}
                      </p>
                      {product.original_price && (
                        <p className="text-xs text-[#B89B8A] line-through">
                          ${product.original_price}
                        </p>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="col-span-2 text-center">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          outOfStock
                            ? 'bg-red-100 text-red-700'
                            : lowStock
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {outOfStock ? (
                          <>
                            <X size={12} />
                            Agotado
                          </>
                        ) : lowStock ? (
                          <>
                            <AlertTriangle size={12} />
                            {stock} uds
                          </>
                        ) : (
                          <>
                            <Check size={12} />
                            {stock} uds
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.active ? 'Activo' : 'Borrador'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(product)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FDF0ED] text-[#8B7355] hover:text-[#D4A59A] transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#8B7355] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D4C4]">
              <h2 className="text-xl font-bold text-[#6B4423]">
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button
                onClick={resetForm}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#FDF0ED] text-[#8B7355] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#6B4423] uppercase tracking-wider">
                    Información general
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">
                      Nombre del producto *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                      placeholder="Ej: Vestido floral"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A] resize-none"
                      placeholder="Descripción del producto..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#8B7355] mb-1.5">
                        Categoría
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                      >
                        <option value="">Seleccionar</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8B7355] mb-1.5">
                        Tipo de producto
                      </label>
                      <select
                        value={formData.category_type}
                        onChange={(e) =>
                          setFormData({ ...formData, category_type: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                      >
                        {CATEGORY_TYPE_CONFIGS.map((c) => (
                          <option key={c.type} value={c.type}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">
                      URL de imagen
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                      placeholder="https://..."
                    />
                    {formData.image && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-[#E8D4C4]">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-[#6B4423] uppercase tracking-wider">
                    Precios y stock
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#8B7355] mb-1.5">
                        Precio *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                        placeholder="299"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#8B7355] mb-1.5">
                        Precio original
                      </label>
                      <input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            original_price: e.target.value,
                            is_sale: !!e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                        placeholder="399"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                      placeholder="SKU-001"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-[#D4A59A]"
                      />
                      <span className="text-sm text-[#6B4423]">Activo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData({ ...formData, featured: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-[#D4A59A]"
                      />
                      <span className="text-sm text-[#6B4423]">Destacado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_new}
                        onChange={(e) =>
                          setFormData({ ...formData, is_new: e.target.checked })
                        }
                        className="w-4 h-4 rounded accent-[#D4A59A]"
                      />
                      <span className="text-sm text-[#6B4423]">Nueva colección</span>
                    </label>
                  </div>

                  {/* Variants Section */}
                  <div className="mt-6 border-t border-[#E8D4C4] pt-6">
                    <h3 className="text-sm font-semibold text-[#6B4423] uppercase tracking-wider mb-4">
                      Variantes
                    </h3>

                    {/* Add variant form */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <select
                        value={newVariant.color}
                        onChange={(e) =>
                          setNewVariant({ ...newVariant, color: e.target.value })
                        }
                        className="flex-1 min-w-[120px] px-3 py-2 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                      >
                        <option value="">Color</option>
                        {getAvailableColors().map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      {getAvailableSizes().length > 0 && (
                        <select
                          value={newVariant.size}
                          onChange={(e) =>
                            setNewVariant({ ...newVariant, size: e.target.value })
                          }
                          className="w-24 px-3 py-2 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                        >
                          <option value="">Talla</option>
                          {getAvailableSizes().map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}

                      <input
                        type="number"
                        value={newVariant.stock}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            stock: Number(e.target.value),
                          })
                        }
                        className="w-20 px-3 py-2 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
                        placeholder="Stock"
                        min={0}
                      />

                      <button
                        onClick={addVariant}
                        disabled={!newVariant.color}
                        className="px-3 py-2 bg-[#6B4423] text-white rounded-xl text-sm font-medium hover:bg-[#8B7355] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Variants list */}
                    {variants.length > 0 && (
                      <div className="space-y-2">
                        {variants.map((v, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-4 py-2.5 bg-[#FDF8F4] rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-[#6B4423]">
                                {v.color}
                              </span>
                              {v.size && (
                                <span className="text-sm text-[#B89B8A]">
                                  | {v.size}
                                </span>
                              )}
                              <span className="text-sm text-[#D4A59A]">
                                {v.stock} uds
                              </span>
                            </div>
                            <button
                              onClick={() => removeVariant(index)}
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-[#B89B8A] hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8D4C4] bg-[#FDF8F4]">
              <button
                onClick={resetForm}
                className="px-5 py-2.5 text-[#8B7355] font-medium rounded-xl hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveProduct}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#6B4423] text-white font-medium rounded-xl hover:bg-[#8B7355] transition-colors"
              >
                <Save size={16} />
                {editing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
