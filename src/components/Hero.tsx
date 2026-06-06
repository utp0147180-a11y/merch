import { ArrowRight, Sparkles, Star } from 'lucide-react';
import TeddyBearLogo from './TeddyBearLogo';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F9F5F1] via-[#FDF8F4] to-[#F5EDE5]">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#E8D4C4] rounded-full blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#FFB6C1] rounded-full blur-3xl opacity-20 animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#D4A59A] rounded-full blur-3xl opacity-20 animate-pulse-slow delay-500" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E8D4C4] to-[#D4A59A] text-[#6B4423] text-xs font-semibold px-4 py-2 rounded-full mb-6 shadow-sm animate-fade-in-up">
              <Sparkles size={14} className="text-[#8B7355]" />
              <span className="tracking-wider">NUEVA COLECCIÓN 2026</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight text-[#6B4423] mb-6 animate-fade-in-up delay-100">
              Elegancia
              <span className="block mt-2 bg-gradient-to-r from-[#D4A59A] to-[#8B7355] bg-clip-text text-transparent">
                Minimalista
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#8B7355] text-base sm:text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-200">
              Descubre nuestra selección curada de ropa y belleza.
              Diseños únicos que celebran tu estilo auténtico.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
              <button className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4A59A] to-[#CDA89C] text-white px-8 py-4 rounded-full font-semibold tracking-wide shadow-lg shadow-[#D4A59A]/30 hover:shadow-xl hover:shadow-[#D4A59A]/40 active:scale-[0.98] transition-all duration-300">
                <span>Explorar Colección</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 border-2 border-[#D4A59A] text-[#8B7355] hover:bg-[#D4A59A] hover:text-white px-8 py-4 rounded-full font-semibold tracking-wide transition-all duration-300">
                Ver Ofertas
              </button>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-10 mt-12 animate-fade-in-up delay-400">
              {[
                { value: '2K+', label: 'Clientes Felices' },
                { value: '150+', label: 'Productos' },
                { value: '4.9', label: 'Calificación' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-[#6B4423]">{value}</div>
                  <div className="text-xs text-[#B89B8A] tracking-wide mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image collage */}
          <div className="relative animate-fade-in-left">
            {/* Main image */}
            <div className="relative z-10 max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A59A] to-[#8B7355] rounded-[2rem] transform rotate-3 scale-95 opacity-20" />
              <div className="relative bg-white p-3 rounded-[2rem] shadow-2xl shadow-[#D4A59A]/20">
                <img
                  src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=900&auto=format&fit=crop"
                  alt="Vestido elegant"
                  className="w-full h-[400px] lg:h-[500px] object-cover rounded-[1.5rem]"
                />

                {/* Floating badge */}
                <div className="absolute -left-4 top-1/4 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 bg-[#FFF0F0] rounded-full flex items-center justify-center">
                    <Star className="text-[#D4A59A] fill-[#D4A59A]" size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-[#B89B8A]">Calificación</div>
                    <div className="text-sm font-bold text-[#6B4423]">4.9/5</div>
                  </div>
                </div>

                {/* Discount badge */}
                <div className="absolute -right-4 top-1/2 bg-gradient-to-br from-[#D4A59A] to-[#8B7355] text-white rounded-2xl shadow-xl px-5 py-4 text-center animate-float-delayed">
                  <div className="text-2xl font-bold">30%</div>
                  <div className="text-[10px] tracking-wider opacity-90">OFF</div>
                </div>

                {/* New product badge */}
                <div className="absolute -right-4 bottom-8 bg-white rounded-xl shadow-lg px-4 py-2 animate-float">
                  <div className="flex items-center gap-2">
                    <TeddyBearLogo size={24} />
                    <span className="text-xs font-semibold text-[#6B4423]">NUEVO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decorative images */}
            <div className="absolute -bottom-8 -left-8 w-32 h-40 rounded-2xl overflow-hidden shadow-lg opacity-70 transform -rotate-12 hidden lg:block animate-fade-in-right delay-200">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop"
                alt="Gloss"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-8 -right-8 w-28 h-36 rounded-2xl overflow-hidden shadow-lg opacity-70 transform rotate-12 hidden lg:block animate-fade-in-right delay-300">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop"
                alt="Paleta"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative bg-white/80 backdrop-blur-sm border-t border-[#E8D4C4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {[
              { label: 'Envío Gratis', value: 'Desde $999' },
              { label: 'Pago Seguro', value: '100% Tranquilidad' },
              { label: 'Soporte WhatsApp', value: '24/7' },
              { label: 'Fácil Devolución', value: '30 días' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-sm font-semibold text-[#6B4423]">{label}</div>
                <div className="text-xs text-[#B89B8A]">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
