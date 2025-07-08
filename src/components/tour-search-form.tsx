
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Tag } from "lucide-react";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";

export function TourSearchForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('query') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await fetch('/api/categories');
            if(res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) {
            params.set('query', query);
        }
        if (category && category !== 'all') {
            params.set('category', category);
        }
        router.push(`/tours?${params.toString()}`);
    };

  return (
    <form onSubmit={handleSearch} className="p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Where to?" 
            className="pl-10 h-12 text-base text-foreground" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full md:flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="pl-10 h-12 text-base text-foreground">
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any category</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={slugify(cat.name)}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
            <Button type="submit" size="lg" className="h-12 w-full text-base">
                <Search className="mr-2 h-5 w-5" />
                Search
            </Button>
        </div>
      </div>
    </form>
  );
}
