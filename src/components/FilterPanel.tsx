"use client";

import { FilterState, DEFAULT_FILTER_STATE, PriceBasis } from "@/types";

interface FilterPanelProps {
  filterState: FilterState;
  onFilterChange: (filter: FilterState) => void;
}

export default function FilterPanel({
  filterState,
  onFilterChange,
}: FilterPanelProps) {
  const { priceRange, priceBasis, deliveryType, usedOnly, minDiscount } = filterState;

  const update = (patch: Partial<FilterState>) => {
    onFilterChange({ ...filterState, ...patch });
  };

  const reset = () => onFilterChange({ ...DEFAULT_FILTER_STATE });

  const formatPrice = (v: number) => `${v.toLocaleString()}원`;

  const PRICE_BASIS_OPTIONS: { value: PriceBasis; label: string }[] = [
    { value: "any", label: "전체" },
    { value: "sale", label: "판매가" },
    { value: "lowestUsed", label: "중고 최저가" },
  ];

  const DELIVERY_OPTIONS: { value: FilterState["deliveryType"]; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "aladin", label: "알라딘배송" },
    { value: "user", label: "회원배송" },
    { value: "space", label: "매장배송" },
  ];

  return (
    <>
      {/* 데스크탑 사이드바 */}
      <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className="sticky top-20 bg-white rounded-xl shadow-md p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">필터</h2>
            <button
              onClick={reset}
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              초기화
            </button>
          </div>

          {/* 가격 범위 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">가격 범위</h3>
              <select
                value={priceBasis}
                onChange={(e) => update({ priceBasis: e.target.value as PriceBasis })}
                className="text-xs border rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-600"
              >
                {PRICE_BASIS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100000}
                value={priceRange[0]}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(100000, Number(e.target.value)));
                  update({ priceRange: [v, priceRange[1]] });
                }}
                className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="최소"
              />
              <span className="text-gray-400 text-sm">~</span>
              <input
                type="number"
                min={0}
                max={100000}
                value={priceRange[1]}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(100000, Number(e.target.value)));
                  update({ priceRange: [priceRange[0], v] });
                }}
                className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="최대"
              />
            </div>
            <div className="text-xs text-gray-500">
              {formatPrice(priceRange[0])} ~ {formatPrice(priceRange[1])}
            </div>
          </section>

          {/* 배송 유형 */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">배송 유형</h3>
            {DELIVERY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value={opt.value}
                  checked={deliveryType === opt.value}
                  onChange={() => update({ deliveryType: opt.value })}
                  className="sr-only peer"
                />
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    deliveryType === opt.value
                      ? "border-indigo-600 bg-indigo-600"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {deliveryType === opt.value && (
                    <span className="w-2 h-2 bg-white rounded-full" />
                  )}
                </span>
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </section>

          {/* 중고만 보기 */}
          <section>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={usedOnly}
                onChange={(e) => update({ usedOnly: e.target.checked })}
                className="sr-only"
              />
              <span
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  usedOnly
                    ? "border-indigo-600 bg-indigo-600"
                    : "border-gray-300 bg-white"
                }`}
              >
                {usedOnly && (
                  <span className="text-white text-xs leading-none">✓</span>
                )}
              </span>
              <span className="text-sm text-gray-700">중고 재고 있는 책만 보기</span>
            </label>
          </section>

          {/* 최소 할인율 */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                최소 할인율
              </h3>
              <span className="text-sm font-medium text-indigo-600">
                {minDiscount}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minDiscount}
              onChange={(e) => update({ minDiscount: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span>90%</span>
            </div>
          </section>
        </div>
      </aside>

      {/* 모바일 컴팩트 필터 바 */}
      <div className="lg:hidden bg-white rounded-xl shadow-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">필터</h2>
          <button
            onClick={reset}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            초기화
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 가격 범위 */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600">
              최소 가격
            </label>
            <input
              type="number"
              min={0}
              max={100000}
              value={priceRange[0]}
              onChange={(e) => {
                const v = Math.max(0, Math.min(100000, Number(e.target.value)));
                update({ priceRange: [v, priceRange[1]] });
              }}
              className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600">
              최대 가격
            </label>
            <input
              type="number"
              min={0}
              max={100000}
              value={priceRange[1]}
              onChange={(e) => {
                const v = Math.max(0, Math.min(100000, Number(e.target.value)));
                update({ priceRange: [priceRange[0], v] });
              }}
              className="w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* 배송 유형 */}
        <div className="flex flex-wrap gap-2">
          {DELIVERY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ deliveryType: opt.value })}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                deliveryType === opt.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 가격 기준 (모바일) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">가격 기준</span>
          <select
            value={priceBasis}
            onChange={(e) => update({ priceBasis: e.target.value as PriceBasis })}
            className="flex-1 text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-600"
          >
            {PRICE_BASIS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 중고만 보기 + 최소 할인율 */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={usedOnly}
              onChange={(e) => update({ usedOnly: e.target.checked })}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                usedOnly
                  ? "border-indigo-600 bg-indigo-600"
                  : "border-gray-300 bg-white"
              }`}
            >
              {usedOnly && (
                <span className="text-white text-xs leading-none">✓</span>
              )}
            </span>
            <span className="text-sm text-gray-700">중고만 보기</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">할인</span>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minDiscount}
              onChange={(e) =>
                update({ minDiscount: Number(e.target.value) })
              }
              className="w-24 accent-indigo-600"
            />
            <span className="text-xs font-medium text-indigo-600 w-8 text-right">
              {minDiscount}%
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
