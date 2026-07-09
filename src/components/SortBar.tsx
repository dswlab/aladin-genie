"use client";

import { SortOption } from "@/types";

interface SortBarProps {
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
  { value: "Accuracy", label: "정확도", icon: "🎯" },
  { value: "PublishTime", label: "출간일", icon: "📅" },
  { value: "SalesPoint", label: "판매평점", icon: "⭐" },
  { value: "CustomerRating", label: "고객평점", icon: "💬" },
  { value: "PriceAsc", label: "가격낮은순", icon: "💰" },
  { value: "PriceDesc", label: "가격높은순", icon: "💎" },
  { value: "DiscountDesc", label: "할인율높은순", icon: "🏷️" },
];

export default function SortBar({ selectedSort, onSortChange }: SortBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700">정렬</h2>
        <span className="text-xs text-gray-400">
          {SORT_OPTIONS.find((o) => o.value === selectedSort)?.icon}{" "}
          {SORT_OPTIONS.find((o) => o.value === selectedSort)?.label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              selectedSort === option.value
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
