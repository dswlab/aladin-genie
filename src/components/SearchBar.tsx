"use client";

import { useState } from "react";

import { QueryType, SearchBarProps } from "@/types";

const QUERY_TYPES: { value: QueryType; label: string }[] = [
  { value: "Keyword", label: "전체" },
  { value: "Title", label: "제목" },
  { value: "Author", label: "저자" },
  { value: "Publisher", label: "출판사" },
];

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState<QueryType>("Keyword");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), queryType);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-800">📚 도서 검색</h2>

      {/* 검색 유형 선택 */}
      <div className="flex gap-2 mb-4">
        {QUERY_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setQueryType(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              queryType === type.value
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* 검색 입력 + 버튼 */}
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="책 제목, 저자명, ISBN을 입력하세요..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-gray-800"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "검색 중..." : "검색"}
        </button>
      </div>
    </form>
  );
}
