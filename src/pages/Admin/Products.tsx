import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Products() {

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  const [showForm, setShowForm] = useState(false);

  const [editing, setEditing] = useState<any>(null);


  const [form, setForm] = useState<any>({
    name:"",
    description:"",
    price:"",
    original_price:"",
    image:"",
    category:"",
    stock:0,
    brand:"",
    sku:"",
    colors:"",
    sizes:"",
    is_sale:false,
    is_new:false,
    featured:false
  });



  const fetchProducts = async()=>{

    const {data,error}=await supabase
      .from("products")
      .select("*")
      .order("created_at",{ascending:false});


    if(!error)
      setProducts(data || []);

  };



  useEffect(()=>{
    fetchProducts();
  },[]);



  const saveProduct = async()=>{


    const productData={

      ...form,

      price:Number(form.price),

      original_price:
        form.original_price
        ? Number(form.original_price)
        : null,

      stock:Number(form.stock),

      colors:
        form.colors
        .split(",")
        .map((x:string)=>x.trim()),

      sizes:
        form.sizes
        .split(",")
        .map((x:string)=>x.trim()),

    };



    let error;


    if(editing){

      const res=await supabase
      .from("products")
      .update(productData)
      .eq("id",editing.id);

      error=res.error;

    }else{


      const res=await supabase
      .from("products")
      .insert(productData);

      error=res.error;

    }



    if(error){

      console.log(error);
      return;

    }



    setShowForm(false);
    setEditing(null);

    setForm({
      name:"",
      description:"",
      price:"",
      original_price:"",
      image:"",
      category:"",
      stock:0,
      brand:"",
      sku:"",
      colors:"",
      sizes:"",
      is_sale:false,
      is_new:false,
      featured:false
    });


    fetchProducts();

  };




  const deleteProduct=async(id:number)=>{

    const ok=confirm(
      "¿Eliminar producto?"
    );

    if(!ok)return;


    await supabase
    .from("products")
    .delete()
    .eq("id",id);


    fetchProducts();

  };





  const filteredProducts=
  products.filter(p=>{

    const matchName=
    p.name
    .toLowerCase()
    .includes(search.toLowerCase());


    const matchCategory=
    category==="Todas"
    ||
    p.category===category;


    return matchName && matchCategory;

  });





  return (

<div className="min-h-screen bg-[#FDF8F4] p-8">


<h1 className="text-3xl font-bold text-[#6B4423] mb-6">
Productos
</h1>



<div className="flex gap-3 mb-6">

<button
onClick={()=>setShowForm(true)}
className="bg-[#6B4423] text-white px-5 py-2 rounded-lg"
>
+ Agregar producto
</button>


<input
className="border rounded-lg px-3"
placeholder="Buscar..."
value={search}
onChange={e=>setSearch(e.target.value)}
/>


<select
className="border rounded-lg px-3"
onChange={e=>setCategory(e.target.value)}
>

<option>
Todas
</option>

<option>
Ropa
</option>

<option>
Belleza
</option>

<option>
Ofertas
</option>


</select>


</div>





{showForm && (

<div className="bg-white p-6 rounded-xl shadow mb-8">


<h2 className="text-xl font-bold mb-4">
{editing ? "Editar producto":"Nuevo producto"}
</h2>



{
[
"name",
"description",
"image",
"category",
"brand",
"sku",
"price",
"original_price",
"stock",
"colors",
"sizes"

].map(field=>(

<input
key={field}
className="border p-2 rounded w-full mb-3"
placeholder={field}
value={form[field]}
onChange={
e=>setForm({
...form,
[field]:e.target.value
})
}
/>

))
}




<label>
<input
type="checkbox"
checked={form.is_sale}
onChange={e=>setForm({...form,is_sale:e.target.checked})}
/>
 Oferta
</label>


<br/>


<label>
<input
type="checkbox"
checked={form.is_new}
onChange={e=>setForm({...form,is_new:e.target.checked})}
/>
 Nuevo
</label>



<br/>


<label>
<input
type="checkbox"
checked={form.featured}
onChange={e=>setForm({...form,featured:e.target.checked})}
/>
 Destacado
</label>



<div className="mt-4">

<button
onClick={saveProduct}
className="bg-green-700 text-white px-5 py-2 rounded-lg"
>
Guardar
</button>


<button
onClick={()=>setShowForm(false)}
className="ml-3 bg-gray-500 text-white px-5 py-2 rounded-lg"
>
Cancelar
</button>


</div>


</div>

)}






<div className="grid md:grid-cols-3 gap-5">


{
filteredProducts.map(product=>(


<div
key={product.id}
className="bg-white rounded-xl shadow p-4"
>


<img
src={product.image}
className="h-48 w-full object-cover rounded-lg"
/>


<h3 className="font-bold mt-3">
{product.name}
</h3>


<p>
${product.price}
</p>


<p>
Stock: {product.stock}
</p>


<p>
Categoría: {product.category}
</p>



<button
onClick={()=>{

setEditing(product);

setForm({
...product,
colors:
product.colors?.join(","),
sizes:
product.sizes?.join(",")
});

setShowForm(true);

}}
className="bg-blue-600 text-white px-3 py-1 rounded mt-3"
>
Editar
</button>



<button
onClick={()=>deleteProduct(product.id)}
className="bg-red-600 text-white px-3 py-1 rounded mt-3 ml-2"
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