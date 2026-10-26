// Importa/ressincroniza o catálogo estático de app/departamentos/departments.ts
// para as tabelas `departments` e `products` no Supabase (ver migration em
// supabase/migrations/20260810_product_catalog.sql). Não toca na planilha CSV
// nem em como o site serve o catálogo hoje — é só uma cópia dos dados.
//
// Uso:
//   npm run db:import-catalog
//
// Requer no .env.local:
//   VITE_SUPABASE_URL             (já usada pelo site)
//   SUPABASE_SERVICE_ROLE_KEY     (Dashboard do Supabase > Project Settings > API,
//                                  "service role" — chave secreta, nunca prefixar
//                                  com VITE_ nem usar no navegador)
import { createClient } from "@supabase/supabase-js";
import { departments } from "../app/departamentos/departments.ts";

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || supabaseUrl.includes("SEU-PROJETO")) {
  throw new Error("VITE_SUPABASE_URL não está configurada em .env.local.");
}
if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY não está configurada em .env.local. Copie a " +
      "'service role key' em Project Settings > API no painel do Supabase."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const departmentRows = departments.map((department, index) => ({
  slug: department.slug,
  name: department.name,
  short_description: department.shortDescription,
  description: department.description,
  icon: department.icon,
  class_name: department.className,
  product_types: department.productTypes,
  featured: department.featured ?? true,
  sort_order: index,
}));

const productRows = departments.flatMap((department, departmentIndex) =>
  department.products.map((product, productIndex) => ({
    id: product.id,
    department_slug: department.slug,
    sku: product.sku ?? null,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    available: product.available,
    sort_order: departmentIndex * 1000 + productIndex,
  }))
);

const { error: departmentsError } = await supabase
  .from("departments")
  .upsert(departmentRows, { onConflict: "slug" });
if (departmentsError) throw new Error(`Falha ao gravar departamentos: ${departmentsError.message}`);

const { error: productsError } = await supabase
  .from("products")
  .upsert(productRows, { onConflict: "id" });
if (productsError) throw new Error(`Falha ao gravar produtos: ${productsError.message}`);

console.log(`Importação concluída: ${departmentRows.length} departamentos, ${productRows.length} produtos.`);
