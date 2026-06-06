import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Check, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onLogin: (user: UserType) => void;
  onLogout: () => void;
}

export default function AuthModal({ isOpen, onClose, user, onLogin, onLogout }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nombre requerido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Teléfono debe tener 10 dígitos';
    if (!formData.email.trim()) newErrors.email = 'Email requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.address.trim()) newErrors.address = 'Dirección requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: crypto.randomUUID(),
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      onClose();
    }, 800);
  };

  const inputClass = (field: string) => `
    w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-[#FDF8F4] border
    focus:outline-none transition-all duration-300
    ${errors[field] ? 'border-red-300 focus:border-red-400' : 'border-[#E8D4C4] focus:border-[#D4A59A]'}
  `;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#E8D4C4]">
            <div>
              <h2 className="text-xl font-bold text-[#6B4423] font-serif">
                {user ? 'Mi Cuenta' : isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </h2>
              <p className="text-xs text-[#B89B8A] mt-1">
                {user ? 'Información de tu cuenta' : 'Completa tus datos para continuar'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5EDE5] transition-colors"
            >
              <X size={18} className="text-[#8B7355]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#FDF0ED] to-[#F5EDE5] rounded-2xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#D4A59A] to-[#8B7355] rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#6B4423]">{user.fullName}</p>
                    <p className="text-xs text-[#B89B8A]">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#FDF8F4] rounded-xl">
                    <Phone size={16} className="text-[#D4A59A]" />
                    <span className="text-sm text-[#6B4423]">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-[#FDF8F4] rounded-xl">
                    <MapPin size={16} className="text-[#D4A59A]" />
                    <span className="text-sm text-[#6B4423]">{user.address}</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="w-full py-3 border border-[#D4A59A] text-[#8B7355] rounded-xl text-sm font-semibold hover:bg-[#FDF0ED] transition-colors mt-4"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B89B8A]" size={16} />
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={inputClass('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B89B8A]" size={16} />
                  <input
                    type="tel"
                    placeholder="Teléfono (10 dígitos)"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass('phone')}
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B89B8A]" size={16} />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass('email')}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.email}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B89B8A]" size={16} />
                  <input
                    type="text"
                    placeholder="Dirección de envío completa"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={inputClass('address')}
                  />
                  {errors.address && (
                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.address}
                    </p>
                  )}
                </div>

                {/* Info note */}
                <div className="bg-[#FDF0ED] rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle size={14} className="text-[#D4A59A] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#8B7355] leading-relaxed">
                    Tus datos serán utilizados únicamente para procesar tu pedido. Nos contactaremos por WhatsApp para confirmar.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#D4A59A] to-[#CDA89C] text-white rounded-xl font-semibold text-sm hover:from-[#8B7355] hover:to-[#A08278] transition-all duration-300 hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Crear Cuenta
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
