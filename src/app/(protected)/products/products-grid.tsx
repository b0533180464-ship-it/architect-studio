/* eslint-disable max-lines-per-function */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  costPrice: number | null;
  retailPrice: number | null;
  currency: string;
  usageCount: number;
  supplier?: { id: string; name: string } | null;
  category?: { id: string; name: string; color: string | null } | null;
}

interface ProductsGridProps {
  products: Product[];
}

function formatCurrency(amount: number | null, currency: string): string {
  if (amount === null) return '-';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
            {/* Image */}
            <div className="relative aspect-square bg-muted">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <CardContent className="p-3">
              {/* Category Badge */}
              {product.category && (
                <Badge
                  variant="secondary"
                  className="mb-2"
                  style={{
                    backgroundColor: product.category.color
                      ? `${product.category.color}20`
                      : undefined,
                    color: product.category.color || undefined,
                  }}
                >
                  {product.category.name}
                </Badge>
              )}

              {/* Name */}
              <h3 className="font-medium line-clamp-2 text-sm">{product.name}</h3>

              {/* SKU */}
              {product.sku && (
                <p className="mt-1 text-xs text-muted-foreground">מק&quot;ט: {product.sku}</p>
              )}

              {/* Supplier */}
              {product.supplier && (
                <p className="mt-1 text-xs text-muted-foreground">{product.supplier.name}</p>
              )}

              {/* Prices */}
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-sm font-semibold">
                  {formatCurrency(product.costPrice, product.currency)}
                </span>
                {product.usageCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {product.usageCount} שימושים
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
