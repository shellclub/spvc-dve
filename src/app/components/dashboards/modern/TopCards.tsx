"use client"
import useSWR from "swr"
import { Icon } from "@iconify/react/dist/iconify.js"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TopCardsProps {
  activeCard: string | null;
  onCardClick: (key: string) => void;
}

const TopCards = ({ activeCard, onCardClick }: TopCardsProps) => {
  const { data, isLoading, error } = useSWR("/api/count", fetcher);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#E8F5E9] border-t-[#2E7D32] rounded-full animate-spin" />
            <span className="text-gray-500 text-lg">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      );
    }

  const TopCardInfo = [
    {
        key: "users",
        title: "ผู้ใช้งานทั้งหมด",
        desc: data?.user ?? 0,
        icon: "tabler:users-group",
        gradient: "from-[#2E7D32] to-[#43A047]",
        lightBg: "bg-[#E8F5E9]",
        iconBg: "bg-[#2E7D32]",
        textColor: "text-[#1B5E20]",
        ringColor: "ring-[#2E7D32]",
      },
      {
        key: "students",
        title: "จำนวนนักศึกษา",
        desc: data?.student ?? 0,
        icon: "tabler:school",
        gradient: "from-[#1565C0] to-[#42A5F5]",
        lightBg: "bg-[#E3F2FD]",
        iconBg: "bg-[#1565C0]",
        textColor: "text-[#0D47A1]",
        ringColor: "ring-[#1565C0]",
      },
      {
        key: "departments",
        title: "จำนวนแผนก",
        desc: data?.department ?? 0,
        icon: "tabler:building-community",
        gradient: "from-[#E65100] to-[#FF9800]",
        lightBg: "bg-[#FFF3E0]",
        iconBg: "bg-[#E65100]",
        textColor: "text-[#BF360C]",
        ringColor: "ring-[#E65100]",
      },
      {
        key: "teachers",
        title: "จำนวนครู",
        desc: data?.teacher ?? 0,
        icon: "tabler:chalkboard",
        gradient: "from-[#6A1B9A] to-[#AB47BC]",
        lightBg: "bg-[#F3E5F5]",
        iconBg: "bg-[#6A1B9A]",
        textColor: "text-[#4A148C]",
        ringColor: "ring-[#6A1B9A]",
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {TopCardInfo.map((item) => (
          <div
            key={item.key}
            onClick={() => onCardClick(item.key)}
            className={`${item.lightBg} rounded-2xl p-6 relative overflow-hidden
                        shadow-sm hover:shadow-lg
                        transform hover:-translate-y-1
                        transition-all duration-300 ease-out
                        cursor-pointer group
                        ${activeCard === item.key ? `ring-2 ${item.ringColor} shadow-lg -translate-y-1` : ''}`}
          >
            {/* Decorative gradient circle */}
            <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${item.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

            {/* Icon */}
            <div className={`w-14 h-14 ${item.iconBg} rounded-xl flex items-center justify-center mb-4
                            shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon icon={item.icon} height={28} className="text-white" />
            </div>

            {/* Text */}
            <p className="text-gray-500 text-base font-medium mb-1">
              {item.title}
            </p>
            <div className="flex items-center justify-between">
              <h3 className={`text-3xl font-bold ${item.textColor}`}>
                {item.desc}
              </h3>
              <Icon
                icon="tabler:chevron-right"
                height={20}
                className={`text-gray-400 group-hover:text-gray-600 transition-all duration-300
                          group-hover:translate-x-1
                          ${activeCard === item.key ? 'rotate-90 text-gray-600' : ''}`}
              />
            </div>
          </div>
        ))}
    </div>
  );
};

export { TopCards }