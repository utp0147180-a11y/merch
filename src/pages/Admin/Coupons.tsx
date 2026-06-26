import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Percent,
  DollarSign,
  Calendar,
  Users,
} from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

const initialFormData = {
  code: '',
  description: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: '',
  min_order_value: '',
  max_uses: '',
  expires_at: '',
  active: true,
};

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCoupons(data as Coupon[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData(initialFormData);
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_value: String(coupon.min_order_value || ''),
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      active: coupon.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;

    await supabase.from('coupons').delete().eq('id', id);
    fetchCoupons();
  };

  const saveCoupon = async () => {
    if (!formData.code || !formData.discount_value) {
      alert('Código y valor de descuento son requeridos');
      return;
    }

    const couponData = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      min_order_value: Number(formData.min_order_value) || 0,
      max_uses: formData.max_uses ? Number(formData.max_uses) : null,
      expires_at: formData.expires_at || null,
      active: formData.active,
    };

    if (editing) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editing.id);

      if (error) {
        alert('Error al actualizar cupón');
        return;
      }
    } else {
      const { error } = await supabase.from('coupons').insert(couponData);

      if (error) {
        alert('Error al crear cupón');
        return;
      }
    }

    resetForm();
    fetchCoupons();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin límite';
    return new Date(dateStr).toLocaleDateString('es-MX');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F4] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#6B4423]">Cupones</h1>
          <p className="text-sm text-[#B89B8A]">{coupons.length} cupones</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#6B4423] text-white px-4 py-2 rounded-xl hover:bg-[#8B7355] transition-colors"
        >
          <Plus size={18} />
          Nuevo cupón
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B89B8A]"
        />
        <input
          type="text"
          placeholder="Buscar cupones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white border border-[#E8D4C4] rounded-xl text-sm focus:outline-none focus:border-[#D4A59A]"
        />
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#D4A59A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-xl border border-[#E8D4C4] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-lg font-bold text-[#6B4423]">
                    {coupon.code}
                  </span>
                  {coupon.description && (
                    <p className="text-xs text-[#B89B8A] mt-0.5">
                      {coupon.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    coupon.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {coupon.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                  {coupon.discount_type === 'percentage' ? (
                    <Percent size={14} className="text-[#D4A59A]" />
                  ) : (
                    <DollarSign size={14} className="text-[#D4A59A]" />
                  )}
                  <span>
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% de descuento`
                      : `$${coupon.discount_value} MXN de descuento`}
                  </span>
                </div>

                {coupon.min_order_value > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                    <DollarSign size={14} className="text-[#D4A59A]" />
                    <span>Mínimo: ${coupon.min_order_value} MXN</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                  <Users size={14} className="text-[#D4A59A]" />
                  <span>
                    {coupon.max_uses
                      ? `${coupon.used_count}/${coupon.max_uses} usos`
                      : `${coupon.used_count} usos`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                  <Calendar size={14} className="text-[#D4A59A]" />
                  <span>Expira: {formatDate(coupon.expires_at)}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-[#F5EDE5]">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm bg-[#FDF8F4] text-[#8B7355] rounded-lg hover:bg-[#F5EDE5] transition-colors"
                >
                  <Edit size={14} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E8D4C4]">
              <h2 className="text-xl font-bold text-[#6B4423]">
                {editing ? 'Editar cupón' : 'Nuevo cupón'}
              </h2>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-full hover:bg-[#FDF8F4] flex items-center justify-center"
              >
                <X size={18} className="text-[#8B7355]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#6B4423] mb-1.5 block">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl font-mono text-lg tracking-wider focus:outline-none focus:border-[#D4A59A]"
                  placeholder="Ej: VERANO20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#6B4423] mb-1.5 block">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl focus:outline-none focus:border-[#D4A59A]"
                  placeholder="20% OFF en toda la tienda"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#6B4423] mb-1.5 block">
                    Tipo de descuento
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as 'percentage' | 'fixed',
                      })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl focus:outline-none focus:border-[#D4A59A]"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#6B4423] mb-1.5 block">
                    Valor *
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl focus:outline-none focus:border-[#D4A59A]"
                    placeholder={formData.discount_type === 'percentage' ? '20' : '100'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#6B4423] mb-1.5 block">
                    Pedido mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_value: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl focus:outline-none focus:border-[#D4A59A]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#6B4423] mb-1.5 block">
                    Usos máximos
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) =>
                      setFormData({ ...formData, max_uses: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl focus:outline-none focus:border-[#D4A59A]"
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#6B4423] mb-1.5 block">
                  Fecha de expiración
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) =>
                    setFormData({ ...formData, expires_at: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-[#FDF8F4] border border-[#E8D4C4] rounded-xl focus:outline-none focus:border-[#D4A59A]"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-[#D4A59A]"
                />
                <span className="text-sm text-[#6B4423]">Cupón activo</span>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t border-[#E8D4C4]">
              <button
                onClick={resetForm}
                className="flex-1 py-2.5 text-[#8B7355] font-medium rounded-xl hover:bg-[#FDF8F4] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveCoupon}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#6B4423] text-white rounded-xl font-medium hover:bg-[#8B7355] transition-colors"
              >
                <Save size={16} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
