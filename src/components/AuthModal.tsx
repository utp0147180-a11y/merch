import { useState } from 'react';
import { X } from 'lucide-react';
import { User as UserType } from '../types';
import { saveUser } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onLogin: (user: UserType) => void;
  onLogout: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
}: AuthModalProps) {

  console.log("🔥 AuthModal cargado, isOpen:", isOpen);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // =========================
  // VALIDACIÓN COMPLETA
  // =========================
  const validate = () => {
    const newErrors: Record<string, string> = {};

    // NOMBRE
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nombre requerido';
    }

    // TELÉFONO (solo números, 10 dígitos)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Teléfono requerido';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Debe tener 10 dígitos';
    }

    // EMAIL (VALIDACIÓN REAL)
    if (!formData.email.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido (ej: correo@gmail.com)';
    }

    // DIRECCIÓN
    if (!formData.address.trim()) {
      newErrors.address = 'Dirección requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🟡 CLICK SUBMIT");

    if (!validate()) {
      console.log("❌ VALIDACIÓN FALLÓ");
      return;
    }

    try {
      setLoading(true);

      console.log("📤 ENVIANDO A SUPABASE...");

      const savedUser = await saveUser({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      });

      console.log("✅ GUARDADO EN SUPABASE:", savedUser);

      onLogin(savedUser);
      onClose();

    } catch (error) {
      console.error("❌ ERROR SUPABASE:", error);
      alert("Error guardando usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {user ? 'Cuenta' : 'Registro'}
            </h2>

            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* USER VIEW */}
          {user ? (
            <div>
              <p>{user.fullName}</p>
              <p>{user.email}</p>

              <button onClick={onLogout} className="mt-4 bg-red-500 text-white p-2 rounded">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">

              {/* NOMBRE */}
              <input
                placeholder="Nombre"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="border p-2 w-full"
              />
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}

              {/* TELÉFONO */}
              <input
                placeholder="Teléfono"
                value={formData.phone}
                inputMode="numeric"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value.replace(/\D/g, '')
                  })
                }
                className="border p-2 w-full"
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}

              {/* EMAIL */}
              <input
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border p-2 w-full"
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

              {/* DIRECCIÓN */}
              <input
                placeholder="Dirección"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border p-2 w-full"
              />
              {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white w-full p-2 rounded"
              >
                {loading ? 'Guardando...' : 'Crear cuenta'}
              </button>

            </form>
          )}

        </div>
      </div>
    </>
  );
}