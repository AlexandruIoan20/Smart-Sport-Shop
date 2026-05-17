"use client";

import { useEffect, useState } from "react";

import CategoryList from "./components/CategoryList"

import type { Category, Product } from "@/types";

export default function DashboardPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<
    Record<string, Product[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const categoriesResponse = await fetch(
        "http://localhost:8081/api/categories"
      );

      if (!categoriesResponse.ok) {
        throw new Error("Nu s-au putut încărca categoriile.");
      }

      const categoriesData: Category[] = await categoriesResponse.json();

      setCategories(categoriesData);

      const productRequests = categoriesData.map(async (category) => {
        const response = await fetch(
          `http://localhost:8081/api/products/category/${category.categoryId}`
        );

        if (!response.ok) {
          return {
            categoryId: category.categoryId,
            products: [],
          };
        }

        const products: Product[] = await response.json();

        return {
          categoryId: category.categoryId,
          products,
        };
      });

      const resolvedProducts = await Promise.all(productRequests);

      const mappedProducts: Record<string, Product[]> = {};

      resolvedProducts.forEach((entry) => {
        mappedProducts[entry.categoryId] = entry.products;
      });

      setProductsByCategory(mappedProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="animate-pulse text-zinc-400">
          Se încarcă dashboard-ul...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-8">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight">
          Sports Store
        </h1>

        <p className="text-zinc-400 mt-2">
          Explorează cele mai bune produse pentru sportul tău preferat.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {categories.map((category) => (
          <CategoryList
            key={category.categoryId}
            category={category}
            products={productsByCategory[category.categoryId] || []}
          />
        ))}
      </div>
    </main>
  );
}