import { notFound } from "next/navigation"

import { ProductForm } from "@/components/entities/ProductForm"
import { productsAPI } from "@/lib/api"

type PageProps = {
  params: Promise<{ sku: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { sku } = await params
  const product = await productsAPI.get(sku)

  if (!product) notFound()

  return <ProductForm mode="edit" initialValues={product} />
}
