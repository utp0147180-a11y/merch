import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Products() {

  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    price: "",
    original_price: "",
    image: "",
    category: "",
    brand: "",
    sku: "",
    has_variants: true,
    variants: []
});

  const [variant, setVariant] = useState({
    color: "",
    size: "",
    stock: 0
  });


  const categories = [
    "Ropa",
    "Belleza",
    "Accesorios",
    "Calzado"
  ];


  const colors = [
    "Negro",
    "Blanco",
    "Rojo",
    "Azul",
    "Rosa",
    "Verde",
    "Beige",
    "Gris",
    "Marrón",
    "Dorado"
  ];


  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "Única"
  ];



  const fetchProducts = async () => {

    const { data } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*)
      `)
      .order(
        "created_at",
        {
          ascending:false
        }
      );


    setProducts(data || []);

  };



  useEffect(()=>{

    fetchProducts();

  },[]);



  const addVariant = ()=>{

    if(!variant.color) return;


    setForm({

      ...form,

      variants:[
        ...form.variants,
        variant
      ]

    });


    setVariant({
      color:"",
      size:"",
      stock:0
    });

  };



  const saveProduct = async()=>{

    let productId = editing?.id;


    if(!editing){

      const {data}=await supabase
      .from("products")
      .insert({

        name:form.name,
        description:form.description,
        price:Number(form.price),
        image:form.image,
        category:form.category,
        brand:form.brand,
        sku:form.sku,
        has_variants:true

      })
      .select()
      .single();


      productId=data.id;


    }else{


      await supabase
      .from("products")
      .update({

        name:form.name,
        description:form.description,
        price:Number(form.price),
        image:form.image,
        category:form.category,
        brand:form.brand,
        sku:form.sku

      })
      .eq(
        "id",
        editing.id
      );



      await supabase
      .from("product_variants")
      .delete()
      .eq(
        "product_id",
        editing.id
      );


    }


    if(form.variants.length){

      await supabase
      .from("product_variants")
      .insert(

        form.variants.map((v:any)=>({

          product_id:productId,
          color:v.color,
          size:v.size,
          stock:Number(v.stock)

        }))

      );

    }


    resetForm();

    fetchProducts();

  };



  const deleteProduct = async(id:number)=>{

    if(!confirm("Eliminar producto?")) return;


    await supabase
    .from("products")
    .delete()
    .eq(
      "id",
      id
    );


    fetchProducts();

  };

    const resetForm = () => {

    setForm({

      name:"",
      description:"",
      price:"",
      image:"",
      category:"",
      brand:"",
      sku:"",
      has_variants:true,
      variants:[]

    });

    setEditing(null);
    setShowForm(false);

  };



  return (

    <div className="min-h-screen bg-[#FDF8F4] p-8">


      <div className="flex justify-between mb-6">

        <h1 className="text-3xl font-bold text-[#6B4423]">
          Productos
        </h1>


        <button

          onClick={()=>{

            resetForm();
            setShowForm(true);

          }}

          className="bg-[#6B4423] text-white px-5 py-2 rounded-lg"

        >
          + Nuevo
        </button>


      </div>





      {showForm && (

        <div className="bg-white p-6 rounded-xl mb-6">


          <input

            placeholder="Nombre"

            value={form.name}

            className="border p-2 w-full mb-2"

            onChange={
              e=>setForm({
                ...form,
                name:e.target.value
              })
            }

          />



          <input

            placeholder="Precio"

            value={form.price}

            className="border p-2 w-full mb-2"

            onChange={
              e=>setForm({
                ...form,
                price:e.target.value
              })
            }

          />



          <input

            placeholder="Imagen URL"

            value={form.image}

            className="border p-2 w-full mb-2"

            onChange={
              e=>setForm({
                ...form,
                image:e.target.value
              })
            }

          />



          <select

            value={form.category}

            className="border p-2 w-full mb-2"

            onChange={
              e=>setForm({
                ...form,
                category:e.target.value
              })
            }

          >

            <option value="">
              Categoría
            </option>


            {categories.map(c=>(

              <option key={c}>
                {c}
              </option>

            ))}


          </select>





          <div className="border p-3 mt-4">


            <h3 className="font-bold mb-2">
              Variantes
            </h3>



            <div className="flex gap-2">


              <select

                className="border p-2"

                value={variant.color}

                onChange={
                  e=>setVariant({
                    ...variant,
                    color:e.target.value
                  })
                }

              >

                <option value="">
                  Color
                </option>

                {colors.map(c=>(

                  <option key={c}>
                    {c}
                  </option>

                ))}

              </select>




              <select

                className="border p-2"

                value={variant.size}

                onChange={
                  e=>setVariant({
                    ...variant,
                    size:e.target.value
                  })
                }

              >

                <option value="">
                  Talla
                </option>


                {sizes.map(s=>(

                  <option key={s}>
                    {s}
                  </option>

                ))}


              </select>




              <input

                type="number"

                placeholder="Stock"

                className="border p-2 w-24"

                value={variant.stock}

                onChange={
                  e=>setVariant({
                    ...variant,
                    stock:Number(e.target.value)
                  })
                }

              />



              <button

                onClick={addVariant}

                className="bg-blue-600 text-white px-3 rounded"

              >
                +
              </button>


            </div>




            {form.variants.map(
              (v:any,i:number)=>(

              <p key={i}>
                {v.color} - {v.size} - Stock:{v.stock}
              </p>

            ))}


          </div>




          <button

            onClick={saveProduct}

            className="bg-green-700 text-white px-5 py-2 mt-4 rounded"

          >
            {editing ? "Actualizar" : "Guardar"}
          </button>



        </div>

      )}






      <div className="grid md:grid-cols-3 gap-5">


        {products.map(p=>(


          <div

            key={p.id}

            className="bg-white p-4 rounded-xl shadow"

          >


            <img

              src={p.image}

              className="h-40 w-full object-cover"

            />



            <h3 className="font-bold mt-2">
              {p.name}
            </h3>



            <p>
              ${p.price}
            </p>



            <p>
              {p.category}
            </p>





            <div className="flex gap-2 mt-3">


              <button

                onClick={() => {
  setEditing(p);

  setForm({
    name: p.name,
    description: p.description || "",
    price: p.price,
    original_price: p.original_price || "",
    image: p.image,
    category: p.category,
    brand: p.brand || "",
    sku: p.sku || "",
    has_variants: true,
    variants: p.product_variants || []
  });

  setShowForm(true);
}}

                    name:p.name || "",

                    description:p.description || "",

                    price:p.price || "",

                    image:p.image || "",

                    category:p.category || "",

                    brand:p.brand || "",

                    sku:p.sku || "",

                    has_variants:true,

                    variants:p.product_variants || []

                  });


                  setShowForm(true);


                }}

                className="bg-blue-600 text-white px-3 py-1 rounded"

              >
                Editar
              </button>





              <button

                onClick={()=>deleteProduct(p.id)}

                className="bg-red-600 text-white px-3 py-1 rounded"

              >
                Eliminar
              </button>



            </div>


          </div>


        ))}


      </div>


    </div>

  );

}