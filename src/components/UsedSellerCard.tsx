interface UsedSellerCardProps {
  type: "aladinUsed" | "userUsed" | "spaceUsed";
  itemCount: number;
  minPrice: number;
  link: string;
}

const SELLER_INFO = {
  aladinUsed: {
    icon: "📦",
    name: "알라딘 직접 배송",
    desc: "알라딘이 검수·배송하는 중고 도서",
    color: "blue",
  },
  userUsed: {
    icon: "👤",
    name: "회원 직접 배송",
    desc: "개인 판매자가 직접 배송하는 중고 도서",
    color: "green",
  },
  spaceUsed: {
    icon: "🏬",
    name: "광활한 우주점",
    desc: "매장 배송 중고 도서",
    color: "purple",
  },
} as const;

const COLOR_CLASSES = {
  blue: "border-blue-200 bg-blue-50",
  green: "border-green-200 bg-green-50",
  purple: "border-purple-200 bg-purple-50",
};

export default function UsedSellerCard({
  type,
  itemCount,
  minPrice,
  link,
}: UsedSellerCardProps) {
  const info = SELLER_INFO[type];

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-xl border p-5 hover:shadow-md transition-shadow ${
        COLOR_CLASSES[info.color]
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{info.icon}</span>
            <h3 className="font-bold text-gray-900">{info.name}</h3>
          </div>
          <p className="text-sm text-gray-500">{info.desc}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-red-500">
            {minPrice > 0 ? `${minPrice.toLocaleString()}원` : "-"}
          </p>
          <p className="text-xs text-gray-400">최저가</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          보유 <strong>{itemCount.toLocaleString()}개</strong>
        </span>
        <span className="text-sm font-medium text-gray-700">
          구매하러 가기 →
        </span>
      </div>
    </a>
  );
}
