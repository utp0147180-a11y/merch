import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Products() {

  const categories = [
    "Ropa",
    "Belleza",
    "Accesorios",
    "Calzado",
    "Ofertas"
  ];

  const colors = [
    "Negro",
    "Blanco",
    "Rojo",
    "Rosa",
    "Azul",
    "Verde",
    "Beige",
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


  const [products,setProducts]=useState<any[]>([]);
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("Todas");

  const [showForm,setShowForm]=useState(false);


  const [form,setForm]=useState<any>({
    name:"",
    description:"",
    price:"",
    original_price:"",
    image:"",
    category:"",
    brand:"",
    sku:"",
    is_sale:false,
    is_new:false,
    featured:false,
    variants:[]
  });



  const [variant,setVariant]=useState({
    color:"",
    size:"",
    stock:0
  });



  const fetchProducts=async()=>{

    const {data,error}=await supabase
    .from("products")
    .select(`
      *,
      product_variants(*)
    `)
    .order("created_at",{ascending:false});


    if(!error)
      setProducts(data || []);

  };



  useEffect(()=>{
    fetchProducts();
  },[]);




  const addVariant=()=>{

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




  const saveProduct=async()=>{


    const {data,error}=await supabase
    .from("products")
    .insert({

      name:form.name,
      description:form.description,
      price:Number(form.price),
      original_price:
        form.original_price
        ? Number(form.original_price)
        : null,

      image:form.image,
      category:form.category,

      brand:form.brand,
      sku:form.sku,

      is_sale:form.is_sale,
      is_new:form.is_new,
      featured:form.featured

    })
    .select()
    .single();



    if(error){

      console.log(error);
      return;

    }



    if(form.variants.length){


      const variants=form.variants.map((v:any)=>({

        product_id:data.id,
        color:v.color,
        size:v.size,
        stock:Number(v.stock)

      }));


      await supabase
      .from("product_variants")
      .insert(variants);


    }



    setShowForm(false);

    setForm({
      name:"",
      description:"",
      price:"",
      original_price:"",
      image:"",
      category:"",
      brand:"",
      sku:"",
      is_sale:false,
      is_new:false,
      featured:false,
      variants:[]
    });


    fetchProducts();


  };





  const deleteProduct=async(id:number)=>{


    if(!confirm("Eliminar producto?"))
      return;


    await supabase
    .from("products")
    .delete()
    .eq("id",id);


    fetchProducts();

  };





  const filtered=products.filter(p=>{


    return (

      p.name
      .toLowerCase()
      .includes(search.toLowerCase())

      &&

      (
        category==="Todas"
        ||
        p.category===category
      )

    );


  });






return (

<div className="min-h-screen bg-[#FDF8F4] p-8">


<h1 className="text-3xl font-bold text-[#6B4423] mb-6">
Productos
</h1>



<button

onClick={()=>setShowForm(true)}

className="bg-[#6B4423] text-white px-5 py-2 rounded-lg mb-6"

>
+ Nuevo producto
</button>




<div className="flex gap-3 mb-6">

<input

className="border p-2 rounded"

placeholder="Buscar"

value={search}

onChange={e=>setSearch(e.target.value)}

/>


<select

className="border p-2 rounded"

onChange={e=>setCategory(e.target.value)}

>

<option>
Todas
</option>


{
categories.map(c=>(

<option key={c}>
{c}
</option>

))
}

</select>

</div>





{
showForm &&

<div className="bg-white p-6 rounded-xl shadow mb-8">


<h2 className="text-xl font-bold mb-4">
Nuevo producto
</h2>



<input
className="border p-2 w-full mb-2"
placeholder="Nombre"
onChange={e=>setForm({...form,name:e.target.value})}
/>



<textarea
className="border p-2 w-full mb-2"
placeholder="Descripción"
onChange={e=>setForm({...form,description:e.target.value})}
/>




<select

className="border p-2 w-full mb-2"

value={form.category}

onChange={e=>setForm({...form,category:e.target.value})}

>

<option>
Categoría
</option>

{
categories.map(c=>(

<option key={c}>
{c}
</option>

))
}

</select>



<input
className="border p-2 w-full mb-2"
placeholder="Imagen URL"
onChange={e=>setForm({...form,image:e.target.value})}
/>



<input
className="border p-2 w-full mb-2"
placeholder="Precio"
onChange={e=>setForm({...form,price:e.target.value})}
/>




<h3 className="font-bold mt-4">
Variantes
</h3>


<div className="flex gap-2 mt-2">


<select

className="border p-2"

value={variant.color}

onChange={e=>setVariant({...variant,color:e.target.value})}

>

<option>
Color
</option>

{
colors.map(c=>(

<option key={c}>
{c}
</option>

))
}

</select>



<select

className="border p-2"

value={variant.size}

onChange={e=>setVariant({...variant,size:e.target.value})}

>

<option>
Talla
</option>

{
sizes.map(s=>(

<option key={s}>
{s}
</option>

))
}

</select>



<input

className="border p-2 w-24"

type="number"

placeholder="Stock"

onChange={e=>setVariant({...variant,stock:Number(e.target.value)})}

/>


<button

onClick={addVariant}

className="bg-blue-600 text-white px-3 rounded"

>
+
</button>


</div>




{
form.variants.map((v:any,i:number)=>(

<p key={i} className="mt-2">

{v.color} - {v.size} - Stock: {v.stock}

</p>

))
}



<button

onClick={saveProduct}

className="bg-green-700 text-white px-5 py-2 rounded mt-5"

>
Guardar
</button>



</div>

}





<div className="grid md:grid-cols-3 gap-5">


{
filtered.map(p=>(

<div
key={p.id}
className="bg-white p-4 rounded-xl shadow"
>


<img
src={p.image}
className="h-40 w-full object-cover rounded"
/>


<h3 className="font-bold mt-3">
{p.name}
</h3>


<p>
${p.price}
</p>


<p>
{p.category}
</p>



<button

onClick={()=>deleteProduct(p.id)}

className="bg-red-600 text-white px-3 py-1 rounded mt-3"

>
Eliminar
</button>



</div>

))
}


</div>



</div>

);

}