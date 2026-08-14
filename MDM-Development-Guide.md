# Convenience Store MDM Application - Development Guide for Cursor

## Overview
Build a Master Data Management (MDM) application for managing stores, vendors, products, and inventory with a powerful universal search capability. Uses Next.js, React, shadcn/ui, and TypeScript.

---

## Phase 1: Project Setup & Architecture

### 1.1 Initialize Project
```bash
npx create-next-app@latest mdm-app --typescript --tailwind --eslint
cd mdm-app
npm install shadcn-ui
npx shadcn-ui@latest init
```

### 1.2 Required Dependencies
```bash
npm install axios zustand react-query date-fns lucide-react
npm install -D typescript @types/node @types/react
```

### 1.3 Project Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── (routes)/
│       ├── stores/
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   │   └── page.tsx
│       │   └── new/
│       │       └── page.tsx
│       ├── vendors/
│       ├── products/
│       ├── inventory/
│       └── search/
│           └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   ├── search/
│   │   ├── UniversalSearch.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchFilters.tsx
│   ├── entities/
│   │   ├── StoreForm.tsx
│   │   ├── VendorForm.tsx
│   │   ├── ProductForm.tsx
│   │   └── InventoryForm.tsx
│   ├── tables/
│   │   ├── StoresTable.tsx
│   │   ├── VendorsTable.tsx
│   │   ├── ProductsTable.tsx
│   │   └── InventoryTable.tsx
│   └── ui/ (shadcn components)
├── lib/
│   ├── types.ts
│   ├── api.ts
│   ├── search-engine.ts
│   ├── store.ts
│   └── utils.ts
├── hooks/
│   ├── useSearch.ts
│   ├── useStore.ts
│   └── useFilters.ts
└── data/
    └── sample-mdm-data.json
```

---

## Phase 2: Data Model & Types

### 2.1 Create Type Definitions (`src/lib/types.ts`)

```typescript
// Core entity types
export interface Store {
  storeId: string;
  storeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  region: string;
  storeType: 'standalone' | 'kiosk' | 'express';
  operatingHours: Record<string, string>;
  squareFootage: number;
  manager: string;
  managerPhone: string;
  isActive: boolean;
}

export interface Vendor {
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  isActive: boolean;
  minimumOrderQuantity: number;
}

export interface Category {
  categoryId: string;
  categoryName: string;
  parentCategoryId: string | null;
  description: string;
}

export interface Product {
  sku: string;
  productName: string;
  categoryId: string;
  vendorId: string;
  vendorSku: string;
  description: string;
  unitOfMeasure: string;
  unitsPerCase: number;
  wholesalePrice: number;
  weight: number;
  barcode: string;
  isActive: boolean;
}

export interface StoreVendorRelationship {
  relationshipId: string;
  storeId: string;
  vendorId: string;
  vendorRepresentative: string;
  vendorPhone: string;
  deliveryFrequency: string;
  deliveryDays: string[];
  isActive: boolean;
}

export interface StoreProductAvailability {
  availabilityId: string;
  storeId: string;
  sku: string;
  retailPrice: number;
  isAvailable: boolean;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
}

export interface InventoryRecord {
  inventoryId: string;
  storeId: string;
  sku: string;
  currentQuantity: number;
  unitOfMeasure: string;
  lastCountDate: string;
  nextCountDate: string;
}

// Search & filter types
export interface SearchResult {
  id: string;
  type: 'store' | 'vendor' | 'product' | 'inventory';
  title: string;
  subtitle: string;
  data: any;
  matchedFields: string[];
  relevanceScore: number;
}

export interface SearchFilters {
  entityType?: string[];
  region?: string[];
  isActive?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
```

### 2.2 Create API Types and Mock Data Handler (`src/lib/api.ts`)

```typescript
import * as types from './types';
import mdmData from '@/data/sample-mdm-data.json';

// In-memory store (replace with real API calls)
let storesData: types.Store[] = mdmData.stores;
let vendorsData: types.Vendor[] = mdmData.vendors;
let productsData: types.Product[] = mdmData.products;
let categoriesData: types.Category[] = mdmData.categories;
let inventoryData: types.InventoryRecord[] = mdmData.inventory;

// Stores
export const storesAPI = {
  list: async () => storesData,
  get: async (id: string) => storesData.find(s => s.storeId === id),
  create: async (store: types.Store) => {
    storesData.push(store);
    return store;
  },
  update: async (id: string, updates: Partial<types.Store>) => {
    const idx = storesData.findIndex(s => s.storeId === id);
    if (idx > -1) {
      storesData[idx] = { ...storesData[idx], ...updates };
    }
    return storesData[idx];
  },
  delete: async (id: string) => {
    storesData = storesData.filter(s => s.storeId !== id);
  }
};

// Vendors
export const vendorsAPI = {
  list: async () => vendorsData,
  get: async (id: string) => vendorsData.find(v => v.vendorId === id),
  create: async (vendor: types.Vendor) => {
    vendorsData.push(vendor);
    return vendor;
  },
  update: async (id: string, updates: Partial<types.Vendor>) => {
    const idx = vendorsData.findIndex(v => v.vendorId === id);
    if (idx > -1) {
      vendorsData[idx] = { ...vendorsData[idx], ...updates };
    }
    return vendorsData[idx];
  },
  delete: async (id: string) => {
    vendorsData = vendorsData.filter(v => v.vendorId !== id);
  }
};

// Products
export const productsAPI = {
  list: async () => productsData,
  get: async (sku: string) => productsData.find(p => p.sku === sku),
  create: async (product: types.Product) => {
    productsData.push(product);
    return product;
  },
  update: async (sku: string, updates: Partial<types.Product>) => {
    const idx = productsData.findIndex(p => p.sku === sku);
    if (idx > -1) {
      productsData[idx] = { ...productsData[idx], ...updates };
    }
    return productsData[idx];
  },
  delete: async (sku: string) => {
    productsData = productsData.filter(p => p.sku !== sku);
  }
};

// Categories
export const categoriesAPI = {
  list: async () => categoriesData,
  tree: async () => buildCategoryTree(categoriesData)
};

// Inventory
export const inventoryAPI = {
  list: async () => inventoryData,
  getByStore: async (storeId: string) => inventoryData.filter(i => i.storeId === storeId),
  create: async (record: types.InventoryRecord) => {
    inventoryData.push(record);
    return record;
  },
  update: async (id: string, updates: Partial<types.InventoryRecord>) => {
    const idx = inventoryData.findIndex(i => i.inventoryId === id);
    if (idx > -1) {
      inventoryData[idx] = { ...inventoryData[idx], ...updates };
    }
    return inventoryData[idx];
  }
};

// Helper
function buildCategoryTree(categories: types.Category[]) {
  const map = new Map();
  const roots: types.Category[] = [];

  categories.forEach(cat => {
    map.set(cat.categoryId, { ...cat, children: [] });
  });

  categories.forEach(cat => {
    if (cat.parentCategoryId) {
      map.get(cat.parentCategoryId)?.children.push(map.get(cat.categoryId));
    } else {
      roots.push(map.get(cat.categoryId));
    }
  });

  return roots;
}
```

---

## Phase 3: Universal Search Engine

### 3.1 Create Search Engine (`src/lib/search-engine.ts`)

```typescript
import * as types from './types';
import * as api from './api';

export class SearchEngine {
  private allData: any[] = [];
  private index: Map<string, string[]> = new Map();

  async initialize() {
    // Build searchable index
    const stores = await api.storesAPI.list();
    const vendors = await api.vendorsAPI.list();
    const products = await api.productsAPI.list();
    const inventory = await api.inventoryAPI.list();

    this.allData = [
      ...stores.map(s => ({ ...s, __type: 'store' })),
      ...vendors.map(v => ({ ...v, __type: 'vendor' })),
      ...products.map(p => ({ ...p, __type: 'product' })),
      ...inventory.map(i => ({ ...i, __type: 'inventory' }))
    ];

    this.buildIndex();
  }

  private buildIndex() {
    this.allData.forEach((item, idx) => {
      const searchableText = this.extractSearchableText(item).toLowerCase();
      const tokens = searchableText.split(/\s+/);

      tokens.forEach(token => {
        if (!this.index.has(token)) {
          this.index.set(token, []);
        }
        this.index.get(token)!.push(idx.toString());
      });
    });
  }

  private extractSearchableText(item: any): string {
    const fields = {
      store: ['storeName', 'address', 'city', 'manager', 'region'],
      vendor: ['vendorName', 'contactPerson', 'email', 'address', 'vendorCategory'],
      product: ['productName', 'description', 'sku', 'barcode', 'vendorSku'],
      inventory: ['sku', 'storeId']
    };

    const fieldsToSearch = fields[item.__type as keyof typeof fields] || [];
    return fieldsToSearch
      .map(field => item[field] || '')
      .filter(Boolean)
      .join(' ');
  }

  search(query: string, filters?: types.SearchFilters): types.SearchResult[] {
    if (!query.trim()) return [];

    const queryTokens = query.toLowerCase().split(/\s+/);
    const scoredResults = new Map<number, { score: number; matchedFields: Set<string> }>();

    // Find matching items
    queryTokens.forEach(token => {
      const matchingIndices = this.findMatches(token);
      matchingIndices.forEach(idx => {
        if (!scoredResults.has(idx)) {
          scoredResults.set(idx, { score: 0, matchedFields: new Set() });
        }
        const entry = scoredResults.get(idx)!;
        entry.score += this.calculateTokenScore(token, this.allData[idx]);
      });
    });

    // Convert to results
    const results: types.SearchResult[] = Array.from(scoredResults.entries())
      .map(([idx, { score, matchedFields }]) => {
        const item = this.allData[idx];
        return {
          id: item.storeId || item.vendorId || item.sku || item.inventoryId,
          type: item.__type,
          title: this.getTitle(item),
          subtitle: this.getSubtitle(item),
          data: item,
          matchedFields: Array.from(matchedFields),
          relevanceScore: score
        };
      })
      .filter(r => r.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply filters
    return this.applyFilters(results, filters).slice(0, 20);
  }

  private findMatches(token: string): number[] {
    const matches: number[] = [];
    for (const [key, indices] of this.index.entries()) {
      if (key.includes(token) || token.includes(key)) {
        matches.push(...indices.map(i => parseInt(i)));
      }
    }
    return [...new Set(matches)];
  }

  private calculateTokenScore(token: string, item: any): number {
    let score = 0;
    const text = this.extractSearchableText(item).toLowerCase();

    // Exact word match
    if (text.split(/\s+/).includes(token)) score += 10;
    // Substring match at start
    if (text.startsWith(token)) score += 5;
    // Contains substring
    if (text.includes(token)) score += 3;

    return score;
  }

  private getTitle(item: any): string {
    switch (item.__type) {
      case 'store':
        return item.storeName;
      case 'vendor':
        return item.vendorName;
      case 'product':
        return item.productName;
      case 'inventory':
        return `Inventory: ${item.sku}`;
      default:
        return 'Unknown';
    }
  }

  private getSubtitle(item: any): string {
    switch (item.__type) {
      case 'store':
        return `${item.city}, ${item.state} • Region: ${item.region}`;
      case 'vendor':
        return `${item.vendorCategory} • ${item.email}`;
      case 'product':
        return `SKU: ${item.sku} • Category: ${item.categoryId}`;
      case 'inventory':
        return `Qty: ${item.currentQuantity} ${item.unitOfMeasure}`;
      default:
        return '';
    }
  }

  private applyFilters(results: types.SearchResult[], filters?: types.SearchFilters) {
    if (!filters) return results;

    return results.filter(result => {
      if (filters.entityType && !filters.entityType.includes(result.type)) {
        return false;
      }
      if (filters.isActive !== undefined && result.data.isActive !== filters.isActive) {
        return false;
      }
      return true;
    });
  }
}

export const searchEngine = new SearchEngine();
```

### 3.2 Create Search Hook (`src/hooks/useSearch.ts`)

```typescript
import { useState, useCallback, useEffect } from 'react';
import { searchEngine } from '@/lib/search-engine';
import * as types from '@/lib/types';

export function useSearch() {
  const [results, setResults] = useState<types.SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<types.SearchFilters>({});

  useEffect(() => {
    searchEngine.initialize();
  }, []);

  const search = useCallback(async (q: string) => {
    setQuery(q);
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 100));
    
    const searchResults = searchEngine.search(q, filters);
    setResults(searchResults);
    setIsLoading(false);
  }, [filters]);

  return {
    query,
    results,
    isLoading,
    filters,
    search,
    setFilters
  };
}
```

---

## Phase 4: shadcn/ui Components Setup

### 4.1 Install Required shadcn Components
```bash
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add command
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
```

---

## Phase 5: Universal Search Component

### 5.1 Universal Search Component (`src/components/search/UniversalSearch.tsx`)

```typescript
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/useSearch';
import { SearchResults } from './SearchResults';
import { SearchFilters } from './SearchFilters';

export function UniversalSearch() {
  const router = useRouter();
  const { query, results, isLoading, filters, search, setFilters } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    search(value);
  };

  const handleResultClick = (result: any) => {
    const routes: Record<string, string> = {
      store: `/stores/${result.data.storeId}`,
      vendor: `/vendors/${result.data.vendorId}`,
      product: `/products/${result.data.sku}`,
      inventory: `/inventory/${result.data.inventoryId}`
    };
    router.push(routes[result.type]);
    setIsOpen(false);
  };

  const clearQuery = () => {
    search('');
  };

  const hasActiveFilters = filters.entityType?.length || filters.isActive !== undefined;

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search stores, vendors, products, inventory..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearQuery}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          ⌘K
        </div>
      </div>

      {/* Filters Toggle */}
      {query && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="mt-2"
        >
          {hasActiveFilters && (
            <Badge variant="secondary" className="mr-2">
              {(filters.entityType?.length || 0) + (filters.isActive !== undefined ? 1 : 0)}
            </Badge>
          )}
          Filters
        </Button>
      )}

      {/* Dropdown Results Panel */}
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg border">
          {showFilters ? (
            <SearchFilters
              filters={filters}
              onChange={setFilters}
            />
          ) : (
            <>
              {isLoading && (
                <div className="p-8 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              )}

              {!isLoading && query && results.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}

              {!isLoading && results.length > 0 && (
                <SearchResults
                  results={results}
                  onResultClick={handleResultClick}
                  query={query}
                />
              )}

              {!isLoading && !query && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <p className="mb-2">Start typing to search</p>
                  <p className="text-xs">Stores • Vendors • Products • Inventory</p>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </div>
  );
}
```

### 5.2 Search Results Component (`src/components/search/SearchResults.tsx`)

```typescript
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Package, Archive } from 'lucide-react';
import * as types from '@/lib/types';

interface SearchResultsProps {
  results: types.SearchResult[];
  onResultClick: (result: types.SearchResult) => void;
  query: string;
}

const typeIcons = {
  store: Building2,
  vendor: Users,
  product: Package,
  inventory: Archive
};

const typeColors = {
  store: 'bg-blue-100 text-blue-800',
  vendor: 'bg-purple-100 text-purple-800',
  product: 'bg-green-100 text-green-800',
  inventory: 'bg-orange-100 text-orange-800'
};

export function SearchResults({ results, onResultClick, query }: SearchResultsProps) {
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, types.SearchResult[]>);

  return (
    <div className="divide-y max-h-96 overflow-y-auto">
      {Object.entries(groupedResults).map(([type, typeResults]) => (
        <div key={type}>
          <div className="px-4 py-2 bg-muted">
            <p className="text-xs font-semibold text-muted-foreground capitalize">
              {type}s ({typeResults.length})
            </p>
          </div>
          {typeResults.map((result) => {
            const Icon = typeIcons[result.type as keyof typeof typeIcons];
            return (
              <Button
                key={result.id}
                variant="ghost"
                className="w-full justify-start h-auto px-4 py-3 hover:bg-accent"
                onClick={() => onResultClick(result)}
              >
                <div className="flex items-start gap-3 w-full">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{result.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{result.subtitle}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {result.matchedFields.slice(0, 3).map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge className={typeColors[result.type as keyof typeof typeColors]}>
                    {Math.round(result.relevanceScore)}%
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

### 5.3 Search Filters Component (`src/components/search/SearchFilters.tsx`)

```typescript
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import * as types from '@/lib/types';

interface SearchFiltersProps {
  filters: types.SearchFilters;
  onChange: (filters: types.SearchFilters) => void;
}

const ENTITY_TYPES = ['store', 'vendor', 'product', 'inventory'];
const REGIONS = ['South', 'North', 'East', 'West'];

export function SearchFilters({ filters, onChange }: SearchFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(filters.entityType || []);
  const [activeOnly, setActiveOnly] = useState(filters.isActive);

  const handleTypeChange = (type: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedTypes, type]
      : selectedTypes.filter(t => t !== type);
    setSelectedTypes(updated);
    onChange({
      ...filters,
      entityType: updated.length > 0 ? updated : undefined
    });
  };

  const handleActiveChange = (checked: boolean) => {
    setActiveOnly(checked ? true : undefined);
    onChange({
      ...filters,
      isActive: checked ? true : undefined
    });
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setActiveOnly(undefined);
    onChange({});
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Entity Types */}
        <div>
          <h3 className="font-medium mb-3">Entity Type</h3>
          <div className="space-y-2">
            {ENTITY_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                />
                <Label htmlFor={type} className="capitalize cursor-pointer">
                  {type}s
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="font-medium mb-3">Status</h3>
          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              checked={activeOnly === true}
              onCheckedChange={handleActiveChange}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active Only
            </Label>
          </div>
        </div>

        {/* Clear Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </div>
    </Card>
  );
}
```

---

## Phase 6: Main Entity Management Components

### 6.1 Stores Table Component (`src/components/tables/StoresTable.tsx`)

```typescript
import { useQuery } from 'react-query';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storesAPI } from '@/lib/api';
import * as types from '@/lib/types';
import { Edit, Trash2, Eye } from 'lucide-react';

export function StoresTable() {
  const { data: stores = [], isLoading } = useQuery('stores', () => storesAPI.list());

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store: types.Store) => (
            <TableRow key={store.storeId}>
              <TableCell className="font-medium">{store.storeName}</TableCell>
              <TableCell>{store.city}, {store.state}</TableCell>
              <TableCell>{store.region}</TableCell>
              <TableCell className="capitalize">{store.storeType}</TableCell>
              <TableCell>{store.manager}</TableCell>
              <TableCell>
                <Badge variant={store.isActive ? 'default' : 'secondary'}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### 6.2 Create Store Form Component (similar pattern for all entities)

Create `src/components/entities/StoreForm.tsx` following the same pattern with form validation using React Hook Form and shadcn Form components.

---

## Phase 7: Layout & Navigation

### 7.1 Header Component (`src/components/layout/Header.tsx`)

```typescript
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">MDM System</h1>
        </div>
        <div className="flex-1 max-w-2xl">
          <UniversalSearch />
        </div>
        <Button variant="ghost" size="icon">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
```

### 7.2 Sidebar Component (`src/components/layout/Sidebar.tsx`)

```typescript
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, Package, Archive, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Stores', href: '/stores', icon: Building2 },
  { label: 'Vendors', href: '/vendors', icon: Users },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Inventory', href: '/inventory', icon: Archive },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/30 h-screen">
      <nav className="space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### 7.3 Root Layout (`src/app/layout.tsx`)

```typescript
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
```

---

## Phase 8: Pages Structure

### 8.1 Stores Page (`src/app/(routes)/stores/page.tsx`)

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { StoresTable } from "@/components/tables/StoresTable"

export default function StoresPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Stores</h2>
          <p className="text-muted-foreground mt-1">Manage all store locations</p>
        </div>
        <Link href="/stores/new">
          <Button gap="2">
            <Plus className="w-4 h-4" />
            New Store
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Directory</CardTitle>
          <CardDescription>All active and inactive locations</CardDescription>
        </CardHeader>
        <CardContent>
          <StoresTable />
        </CardContent>
      </Card>
    </div>
  )
}
```

### 8.2 Search Page (`src/app/(routes)/search/page.tsx`)

```typescript
'use client';

import { UniversalSearch } from "@/components/search/UniversalSearch"
import { Card, CardContent } from "@/components/ui/card"

export default function SearchPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Search MDM</h2>
        <p className="text-muted-foreground mt-1">Find stores, vendors, products, and inventory</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <UniversalSearch />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Phase 9: Implementation Checklist

**Setup & Configuration**
- [ ] Initialize Next.js project with TypeScript
- [ ] Install shadcn/ui and all required components
- [ ] Setup Tailwind CSS and configure
- [ ] Create project folder structure

**Data Layer**
- [ ] Create types.ts with all entity interfaces
- [ ] Create api.ts with CRUD operations
- [ ] Integrate sample MDM JSON data
- [ ] Add React Query for data fetching

**Search Engine**
- [ ] Implement search-engine.ts with tokenization
- [ ] Create relevance scoring algorithm
- [ ] Add filter support (entity type, status, etc.)
- [ ] Implement index building

**Components**
- [ ] Create UniversalSearch component with keyboard shortcut (Cmd+K)
- [ ] Create SearchResults with grouped results
- [ ] Create SearchFilters with faceted filtering
- [ ] Create useSearch hook

**Entity Tables**
- [ ] StoresTable with sorting, filtering, pagination
- [ ] VendorsTable
- [ ] ProductsTable
- [ ] InventoryTable

**Entity Forms**
- [ ] StoreForm with validation
- [ ] VendorForm
- [ ] ProductForm
- [ ] InventoryForm

**Layout & Navigation**
- [ ] Header with UniversalSearch
- [ ] Sidebar with navigation
- [ ] Root layout structure
- [ ] Page routing

**Detail Pages**
- [ ] Store detail page with related vendors/products
- [ ] Vendor detail page
- [ ] Product detail page
- [ ] Inventory detail page

**Features**
- [ ] CRUD operations for all entities
- [ ] Relationships visualization (store-vendor, product availability)
- [ ] Bulk operations support
- [ ] Export functionality (optional)
- [ ] Audit logging (optional)

---

## Phase 10: Enhanced Search Features (Future)

### Advanced Search Capabilities to Consider:
1. **Fuzzy search** - Handle typos with Levenshtein distance
2. **Synonyms** - Map "vendor" → "supplier", "store" → "location"
3. **Faceted search** - Drill down by region, category, status
4. **Recent searches** - Store user search history
5. **Suggested queries** - AI-powered query suggestions
6. **Cross-entity relationships** - "Show all products from Vendor X in Store Y"
7. **Analytics** - Track most searched items, common queries
8. **Export results** - CSV/Excel export with formatting

---

## Key Implementation Tips

1. **Search Performance**: Debounce search input (300ms) to avoid excessive re-renders
2. **Mobile Responsiveness**: Use responsive grid layouts with shadcn's built-in support
3. **Accessibility**: Include ARIA labels, keyboard navigation (Tab, Enter, Esc)
4. **Error Handling**: Implement proper error boundaries and user feedback
5. **Loading States**: Use skeleton loaders for better UX
6. **Data Persistence**: Consider localStorage for filters and recent searches
7. **Testing**: Add Jest/React Testing Library tests for search engine and components

---

## API Integration Notes

When ready to connect to a real API:

1. Replace mock API calls in `lib/api.ts` with actual HTTP requests
2. Use axios or fetch with proper error handling
3. Implement proper authentication (JWT tokens)
4. Add request/response interceptors
5. Implement optimistic updates for better UX
6. Add retry logic for failed requests
7. Cache responses with React Query

---

**Next Steps**: Start with Phase 1-3, get the data model and search engine working, then build UI components layer by layer. Test search functionality before building individual entity management pages.
