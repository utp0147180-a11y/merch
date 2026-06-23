-- Seed products from data.ts
INSERT INTO products (id, name, description, price, original_price, image, category, colors, sizes, badge, rating, reviews, is_sale, is_new, active)
VALUES
-- ROPA
(1, 'Top Aura Nude', 'Elegante top de corte relajado en tonos nude. Perfecto para looks casuales o formales.', 349, 499, 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?q=80&w=800&auto=format&fit=crop', 'Ropa', ARRAY['#D4A59A', '#E8D4C4', '#8B7355', '#F5E6D3'], ARRAY['XS', 'S', 'M', 'L'], 'OFERTA', 4.9, 2847, true, false, true),
(2, 'Vestido Mocha Chic', 'Vestido midi con corte A-line en tela premium. Elegancia atemporal.', 699, 999, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop', 'Ropa', ARRAY['#8B7355', '#D4A59A', '#000000'], ARRAY['XS', 'S', 'M', 'L', 'XL'], 'NUEVA COLECCIÓN', 4.8, 1923, false, true, true),
(3, 'Enterizo Luna', 'Enterizo de corte elegante con escote en V. Ideal para eventos especiales.', 799, 1199, 'https://images.unsplash.com/photo-1595777457589-95e059d581b8?q=80&w=800&auto=format&fit=crop', 'Ropa', ARRAY['#F5E6D3', '#D4A59A', '#8B7355'], ARRAY['S', 'M', 'L'], '-33%', 4.7, 1567, true, false, true),
(4, 'Blusa Soft Beige', 'Blusa de seda sintética con cuello elegante. Comodidad y estilo.', 299, NULL, 'https://images.unsplash.com/photo-1564257631407-4deb1e1c8b5f?q=80&w=800&auto=format&fit=crop', 'Ropa', ARRAY['#F5E6D3', '#E8D4C4', '#FFFFFF', '#D4A59A'], ARRAY['XS', 'S', 'M', 'L'], 'MÁS VENDIDO', 4.9, 4102, false, true, true),
(5, 'Falda Mocha Elegante', 'Falda midi con pliegues subtle. Versátil y sofisticada.', 449, 649, 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj9a?q=80&w=800&auto=format&fit=crop', 'Ropa', ARRAY['#8B7355', '#D4A59A', '#000000'], ARRAY['XS', 'S', 'M', 'L'], 'OFERTA', 4.6, 892, true, false, true),
(6, 'Pantalón Wide Nude', 'Pantalón de pierna ancha en tono nude. Comodidad premium.', 549, NULL, 'https://images.unsplash.com/photo-1594633312681-df85e8b4c0c5?q=80&w=800&auto=format&fit=crop', 'Ropa', ARRAY['#E8D4C4', '#D4A59A', '#8B7355'], ARRAY['XS', 'S', 'M', 'L', 'XL'], NULL, 4.8, 2234, false, true, true),
-- BELLEZA
(7, 'Paleta Velvet Glow', 'Paleta de sombras con 12 tonos nude y rosa. Alta pigmentación.', 349, 499, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', 'Belleza', ARRAY['#D4A59A', '#E8D4C4', '#FFB6C1', '#8B7355'], NULL, 'TOP VENTAS', 4.9, 5821, true, false, true),
(8, 'Gloss Crystal Shine', 'Brillo labial con efecto cristal. Hasta 8 horas de duración.', 149, 199, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop', 'Belleza', ARRAY['#FFB6C1', '#D4A59A', '#E8D4C4', '#8B7355'], NULL, 'OFERTA', 4.8, 3012, true, false, true),
(9, 'Serum Golden Elixir', 'Sérum facial con vitamina C y ácido hialurónico. Piel radiante.', 599, NULL, 'https://images.unsplash.com/photo-1608248597271-f8298798654d?q=80&w=800&auto=format&fit=crop', 'Belleza', ARRAY['#E8D4C4'], NULL, 'NUEVO', 4.7, 1847, false, true, true),
(10, 'Crema Soft Glow SPF 50', 'Crema hidratante con protector solar y efecto glow natural.', 399, 549, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop', 'Belleza', ARRAY['#F5E6D3'], NULL, '-27%', 4.8, 2654, true, false, true),
(11, 'Labial Matte Mocha', 'Labial mate de larga duración. Tonalidades terra y nude.', 179, NULL, 'https://images.unsplash.com/photo-1586495777744-44e227ba47fe?q=80&w=800&auto=format&fit=crop', 'Belleza', ARRAY['#8B7355', '#D4A59A', '#C48B7F', '#E8BEAC'], NULL, NULL, 4.6, 4231, false, false, true),
(12, 'Kit Skincare Premium', 'Set completo de skincare: limpiador, tónico, sérum y crema.', 899, 1299, 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?q=80&w=800&auto=format&fit=crop', 'Belleza', ARRAY['#F5E6D3', '#E8D4C4'], NULL, 'EXCLUSIVO', 4.9, 987, true, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image = EXCLUDED.image,
  category = EXCLUDED.category,
  colors = EXCLUDED.colors,
  sizes = EXCLUDED.sizes,
  badge = EXCLUDED.badge,
  rating = EXCLUDED.rating,
  reviews = EXCLUDED.reviews,
  is_sale = EXCLUDED.is_sale,
  is_new = EXCLUDED.is_new,
  active = EXCLUDED.active;
