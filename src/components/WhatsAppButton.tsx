import { MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../data';

export default function WhatsAppButton() {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-15 h-15 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-green-600/40 hover:shadow-green-600/60 hover:scale-110 transition-all duration-300 animate-bounce-in group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={26} className="text-white fill-white" strokeWidth={0} />

      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />

      {/* Tooltip */}
      <span className="absolute right-16 bg-white text-[#6B4423] text-xs font-medium px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all whitespace-nowrap">
        ¿Necesitas ayuda?
      </span>
    </button>
  );
}
