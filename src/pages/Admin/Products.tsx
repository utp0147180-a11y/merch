import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setProducts(data || []);
    } else {
      console.log(error);
    }
  };

  const createProduct = async () => {
    const { error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        original_price: originalPrice || null,
        image,
        category,
        is_sale: !!originalPrice,
      });

    if (error) {
      console.log(error);
      return;
    }

    setName("");
    setDescription("");
    setPrice("");
    setOriginalPrice("");
    setImage("");
    setCategory("");

    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF8F4] p-8">

      <h1 className="text-3xl font-bold text-[#6B4423] mb-8">
        Productos
      </h1>


      {/* CREAR PRODUCTO */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-xl font-bold mb-4">
          Nuevo producto
        </h2>

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Nombre"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <textarea
          className="border p-2 rounded w-full mb-3"
          placeholder="Descripción"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Categoría (ropa, maquillaje...)"
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Precio actual"
          value={price}
          onChange={(e)=>setPrice(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Precio anterior (oferta)"
          value={originalPrice}
          onChange={(e)=>setOriginalPrice(e.target.value)}
        />

        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="URL imagen"
          value={image}
          onChange={(e)=>setImage(e.target.value)}
        />


        <button
          onClick={createProduct}
          className="bg-[#6B4423] text-white px-5 py-2 rounded-lg"
        >
          Guardar producto
        </button>

      </div>


      {/* LISTA */}
      <div className="grid md:grid-cols-3 gap-5">

        {products.map((product)=>(
          <div
            key={product.id}
            className="bg-white rounded-xl shadow p-4"
          >

            {product.image && (
              <img
                src={product.image}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}

            <h3 className="font-bold text-lg">
              {product.name}
            </h3>

            <p>
              Categoría: {product.category}
            </p>

            <p className="font-bold">
              ${product.price}
            </p>

            {product.is_sale && (
              <p className="text-red-500">
                Antes: ${product.original_price}
              </p>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}