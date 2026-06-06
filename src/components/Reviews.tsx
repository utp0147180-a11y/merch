import { Star, Quote } from 'lucide-react';
import { reviews } from '../data';

export default function Reviews() {
  return (
    <section className="py-16 bg-gradient-to-b from-[#FDF8F4] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4A59A] text-xs font-semibold uppercase tracking-widest mb-2">Testimonios</p>
          <h2 className="text-3xl font-serif font-bold text-[#6B4423] mb-4">Lo que dicen nuestras clientas</h2>
          <p className="text-[#8B7355] text-sm max-w-md mx-auto">Miles de clientas satisfechas confían en Merch Ray para su estilo y belleza</p>
        </div>

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-[#F5EDE5] group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote decoration */}
              <Quote size={32} className="absolute top-4 right-4 text-[#E8D4C4] opacity-40 group-hover:opacity-20 transition-opacity" />

              {/* Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4A59A]">
                  <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-[#6B4423] text-sm">{review.name}</p>
                  <p className="text-[10px] text-[#B89B8A]">{review.date}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < review.rating ? 'text-[#D4A59A] fill-[#D4A59A]' : 'text-[#E8D4C4]'}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-sm text-[#6B4423] leading-relaxed mb-3">{review.text}</p>

              {/* Product tag */}
              <div className="inline-flex items-center bg-[#FDF0ED] rounded-full px-3 py-1.5">
                <span className="text-[10px] text-[#8B7355] font-medium">{review.product}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Overall rating */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-md border border-[#E8D4C4]">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="text-[#D4A59A] fill-[#D4A59A]" />
              ))}
            </div>
            <div className="text-left border-l border-[#E8D4C4] pl-4">
              <div className="text-2xl font-bold text-[#6B4423]">4.9</div>
              <div className="text-[10px] text-[#B89B8A]">2,000+ reseñas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
