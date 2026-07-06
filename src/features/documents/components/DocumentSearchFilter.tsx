"use client";

import { DocumentStatus, DOCUMENT_CATEGORIES } from "@/features/documents/types";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FILE_TYPES = ["pdf", "docx", "xlsx", "csv", "txt", "png", "jpg", "jpeg"];
const STATUSES: DocumentStatus[] = ["ACTIVE", "ARCHIVED", "DISABLED"];

export function DocumentSearchFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?${createQueryString({ search: search || null })}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString({ [key]: value || null })}`);
  };

  const handleClear = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasActiveFilters =
    searchParams.has("search") ||
    searchParams.has("category") ||
    searchParams.has("fileType") ||
    searchParams.has("status");

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาด้วยชื่อไฟล์ ชื่อเรื่อง หรือคีย์เวิร์ด..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="default">
          ค้นหา
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-gray-100" : ""}
        >
          <SlidersHorizontal className="h-4 w-4 mr-1" />
          ตัวกรอง
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-blue-500 inline-block" />
          )}
        </Button>
        {hasActiveFilters && (
          <Button type="button" variant="ghost" onClick={handleClear} className="text-gray-500">
            ล้างทั้งหมด
          </Button>
        )}
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 border rounded-lg">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">หมวดหมู่</label>
            <select
              value={searchParams.get("category") ?? ""}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">ทั้งหมด</option>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* File Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ประเภทไฟล์</label>
            <select
              value={searchParams.get("fileType") ?? ""}
              onChange={(e) => handleFilterChange("fileType", e.target.value)}
              className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">ทั้งหมด</option>
              {FILE_TYPES.map((type) => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">สถานะ</label>
            <select
              value={searchParams.get("status") ?? ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full text-sm p-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">ทั้งหมด</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
