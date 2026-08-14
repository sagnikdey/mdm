import "server-only"

import { query } from "@/lib/db"
import { mapCategory, type CategoryRow } from "@/lib/db/mappers"
import type { Category, CategoryTreeNode } from "@/lib/types"

export async function listCategories(): Promise<Category[]> {
  const result = await query<CategoryRow>(
    `SELECT * FROM categories ORDER BY category_name`
  )
  return result.rows.map(mapCategory)
}

export async function getCategory(id: string): Promise<Category | undefined> {
  const result = await query<CategoryRow>(
    `SELECT * FROM categories WHERE category_id = $1`,
    [id]
  )
  const row = result.rows[0]
  return row ? mapCategory(row) : undefined
}

export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const categories = await listCategories()
  const map = new Map<string, CategoryTreeNode>()

  categories.forEach((cat) => {
    map.set(cat.categoryId, { ...cat, children: [] })
  })

  const roots: CategoryTreeNode[] = []

  categories.forEach((cat) => {
    const node = map.get(cat.categoryId)!
    if (cat.parentCategoryId) {
      map.get(cat.parentCategoryId)?.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}
