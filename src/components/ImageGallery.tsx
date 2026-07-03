import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Product, ProductImage, ProductVariantImage } from '../types';

interface ImageGalleryProps {
  product: Product;
  selectedColor?: string;
  className?: string;
}

export default function ImageGallery({ product, selectedColor, className = '' }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get images for the selected color, or fall back to product images
  const images = useMemo(() => {
    // If we have variant images for this color, use them
    if (selectedColor && product.variant_images) {
      const colorImages = product.variant_images.filter(
        (vi) => vi.variant_color === selectedColor
      );
      if (colorImages.length > 0) {
        return colorImages.map((vi) => ({
          id: vi.id,
          image_url: vi.image_url,
          alt_text: vi.alt_text || `${product.name} - ${selectedColor}`,
          is_primary: false,
        }));
      }
    }

    // Fall back to product_images
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || product.name,
        is_primary: img.is_primary,
      })).sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0));
    }

    // Final fallback to main product image
    if (product.image) {
      return [{
        id: 0,
        image_url: product.image,
        alt_text: product.name,
        is_primary: true,
      }];
    }

    return [];
  }, [product, selectedColor]);

  // Reset selected index when color changes
  useEffect(() => {
    setSelectedIndex(0);
    setIsZoomed(false);
  }, [selectedColor]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const diffX = touchStart.x - touchEnd.x;
    const diffY = Math.abs(touchStart.y - touchEnd.y);

    // Only trigger swipe if horizontal movement is greater than vertical
    // and the swipe is significant enough
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStart(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const img = containerRef.current.querySelector('img');
    if (img) {
      img.style.transformOrigin = `${x}% ${y}%`;
    }
  };

  if (images.length === 0) {
    return (
      <div className={`bg-[#FDF8F4] flex items-center justify-center ${className}`}>
        <div className="text-[#B89B8A] text-sm">Sin imagenes</div>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Main Image Area */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-[#FDF8F4] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
      >
        {/* Main Image */}
        <div className="relative w-full h-full min-h-[300px] md:min-h-[400px]">
          <img
            src={currentImage.image_url}
            alt={currentImage.alt_text || product.name}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            loading="lazy"
          />
        </div>

        {/* Navigation Arrows - only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
              <ChevronLeft size={20} className="text-[#6B4423]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <ChevronRight size={20} className="text-[#6B4423]" />
            </button>
          </>
        )}

        {/* Zoom Button */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        >
          {isZoomed ? (
            <ZoomOut size={18} className="text-[#6B4423]" />
          ) : (
            <ZoomIn size={18} className="text-[#6B4423]" />
          )}
        </button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - only show if multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 bg-white border-t border-[#E8D4C4] overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-[#D4A59A] ring-2 ring-[#D4A59A]/30'
                  : 'border-[#E8D4C4] hover:border-[#D4A59A]'
              }`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text || `Image ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
