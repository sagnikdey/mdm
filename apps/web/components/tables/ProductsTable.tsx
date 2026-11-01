"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { Badge, Skeleton, SortableDataTable } from "@sagui/ui"

import { EntityRowActions } from "@/components/entities/entity-row-actions"
import { categoriesAPI, productsAPI, vendorsAPI } from "@/lib/api-client"

export function ProductsTable() {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsAPI.list(),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesAPI.list(),
  })

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => vendorsAPI.list(),
  })

  const rows = useMemo(
    () =>
      products.map((product) => ({
        sku: product.sku,
        productName: product.productName,
        categoryName:
          categories.find((c) => c.categoryId === product.categoryId)
            ?.categoryName ?? product.categoryId,
        vendorName:
          vendors.find((v) => v.vendorId === product.vendorId)?.vendorName ??
          product.vendorId,
        wholesalePrice: product.wholesalePrice,
        status: product.isActive ? "Active" : "Inactive",
      })),
    [products, categories, vendors]
  )

  if (productsLoading) return <Skeleton label="Loading products" lines={5} />

  return (
    <SortableDataTable
      caption="Products"
      rows={rows}
      rowKey="sku"
      itemName={{ one: "product", other: "products" }}
      searchable
      searchPlaceholder="Search products..."
      viewOptions
      pageSize={10}
      columns={[
        {
          key: "productName",
          label: "Product",
          hideable: false,
          render: (value, row) => (
            <Link href={`/products/${row.sku}`} className="font-medium hover:underline">
              {String(value)}
            </Link>
          ),
        },
        { key: "sku", label: "SKU", width: "10%" },
        { key: "categoryName", label: "Category", filterable: true },
        { key: "vendorName", label: "Vendor", filterable: true },
        {
          key: "wholesalePrice",
          label: "Wholesale",
          numeric: true,
          render: (value) => `$${Number(value).toFixed(2)}`,
        },
        {
          key: "status",
          label: "Status",
          filterable: true,
          render: (value) => (
            <Badge tone={value === "Active" ? "success" : "neutral"}>{String(value)}</Badge>
          ),
        },
        {
          key: "actions",
          label: "Actions",
          sortable: false,
          searchable: false,
          hideable: false,
          render: (_value, row) => (
            <EntityRowActions
              viewHref={`/products/${row.sku}`}
              editHref={`/products/${row.sku}/edit`}
              entityLabel="Product"
              queryKey={["products"]}
              onDelete={() => productsAPI.delete(row.sku)}
            />
          ),
        },
      ]}
    />
  )
}
