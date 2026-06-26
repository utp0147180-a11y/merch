import { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Heart, User, Package } from 'lucide-react';
import TeddyBearLogo from './TeddyBearLogo';

interface HeaderProps {
  cartCount: number;
  wishlistCount?: number;
  onCartOpen: () => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAuthOpen: () => void;
  user: { fullName: string; id?: string } | null;
  onOrdersOpen?: () => void;
  onWishlistOpen?: () => void;
}

export default function Header({
  cartCount,
  wishlistCount = 0,
  onCartOpen,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onAuthOpen,
  user,
  onOrdersOpen,
  onWishlistOpen,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8D4C4]">
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-[#D4A59A] via-[#CDA89C] to-[#D4A59A] text-white text-center text-xs py-2.5 px-4 font-medium tracking-widest">
        ENVÍO GRATIS en compras mayores a $999 MXN • 30% OFF en nueva colección
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-[#8B7355] hover:text-[#D4A59A] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>

            <div className="flex items-center gap-2.5">
              <TeddyBearLogo size={44} className="animate-float" />
              <div className="flex flex-col">
                <span className="text-xl font-serif font-semibold tracking-[0.15em] text-[#6B4423]">MERCH RAY</span>
                <span className="text-[8px] tracking-[0.3em] text-[#B89B8A] uppercase">Boutique & Beauty</span>
              </div>
            </div>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Inicio', key: 'Todo' },
              { label: 'Ropa', key: 'Ropa' },
              { label: 'Belleza', key: 'Belleza' },
              { label: 'Accesorios', key: 'Accesorios' },
              { label: 'Ofertas', key: 'Ofertas' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => onCategoryChange(item.key)}
                className={`text-sm tracking-wide font-medium transition-all duration-300 relative group ${
                  activeCategory === item.key
                    ? 'text-[#8B7355]'
                    : 'text-[#A08278] hover:text-[#8B7355]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-[#D4A59A] transition-all duration-300 ${
                    activeCategory === item.key
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            ))}
          </nav>

          {/* Right: Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B89B8A]" size={16} strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-48 lg:w-64 pl-9 pr-4 py-2.5 text-sm bg-[#F9F5F1] border border-[#E8D4C4] rounded-full focus:outline-none focus:border-[#D4A59A] focus:bg-white transition-all placeholder:text-[#B89B8A]"
                />
              </div>
            </div>

            {/* Mobile Search Toggle */}
            <button
              className="md:hidden p-2.5 text-[#8B7355] hover:text-[#D4A59A] transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={onOrdersOpen}
                  className="hidden sm:flex items-center gap-1.5 p-2.5 text-[#8B7355] hover:text-[#D4A59A] transition-colors"
                  title="Mis pedidos"
                >
                  <Package size={20} strokeWidth={1.5} />
                </button>
                <button
                  onClick={onWishlistOpen}
                  className="hidden sm:flex items-center gap-1.5 p-2.5 text-[#8B7355] hover:text-[#D4A59A] transition-colors relative"
                  title="Favoritos"
                >
                  <Heart size={20} strokeWidth={1.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#D4A59A] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthOpen}
                className="hidden sm:flex items-center gap-1.5 p-2.5 text-[#8B7355] hover:text-[#D4A59A] transition-colors"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative flex items-center gap-2 bg-[#D4A59A] hover:bg-[#CDA89C] text-white px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-[#D4A59A]/20"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8B7355] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${searchOpen ? 'max-h-16 pb-4' : 'max-h-0'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B89B8A]" size={16} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F9F5F1] border border-[#E8D4C4] rounded-full focus:outline-none focus:border-[#D4A59A]"
              autoFocus
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
          <nav className="flex flex-col gap-2 pt-2">
            {[
              { label: 'Inicio', key: 'Todo' },
              { label: 'Ropa', key: 'Ropa' },
              { label: 'Belleza', key: 'Belleza' },
              { label: 'Accesorios', key: 'Accesorios' },
              { label: 'Ofertas', key: 'Ofertas' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onCategoryChange(item.key);
                  setMenuOpen(false);
                }}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === item.key
                    ? 'bg-[#D4A59A] text-white'
                    : 'text-[#8B7355] hover:bg-[#F9F5F1]'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Mobile user actions */}
            {user && (
              <>
                <button
                  onClick={() => {
                    onOrdersOpen?.();
                    setMenuOpen(false);
                  }}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-[#8B7355] hover:bg-[#F9F5F1] flex items-center gap-2"
                >
                  <Package size={18} />
                  Mis Pedidos
                </button>
                <button
                  onClick={() => {
                    onWishlistOpen?.();
                    setMenuOpen(false);
                  }}
                  className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-[#8B7355] hover:bg-[#F9F5F1] flex items-center gap-2"
                >
                  <Heart size={18} />
                  Favoritos
                  {wishlistCount > 0 && (
                    <span className="bg-[#D4A59A] text-white text-[10px] px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
