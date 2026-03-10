"use client"
import { useState } from "react"
import useSWR from "swr"
import { Icon } from "@iconify/react/dist/iconify.js"
import { userRole } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DetailTableProps {
  cardKey: string;
  onClose: () => void;
}

// Card config
const cardConfig: Record<string, { title: string; icon: string; iconBg: string; apiUrl: string }> = {
  users: {
    title: "รายชื่อผู้ใช้งานทั้งหมด",
    icon: "tabler:users-group",
    iconBg: "bg-[#2E7D32]",
    apiUrl: "/api/users",
  },
  students: {
    title: "รายชื่อนักศึกษาทั้งหมด",
    icon: "tabler:school",
    iconBg: "bg-[#1565C0]",
    apiUrl: "/api/students",
  },
  departments: {
    title: "รายชื่อแผนกทั้งหมด",
    icon: "tabler:building-community",
    iconBg: "bg-[#E65100]",
    apiUrl: "/api/departments",
  },
  teachers: {
    title: "รายชื่อครูทั้งหมด",
    icon: "tabler:chalkboard",
    iconBg: "bg-[#6A1B9A]",
    apiUrl: "/api/teachers",
  },
};

const DetailTable = ({ cardKey, onClose }: DetailTableProps) => {
  const config = cardConfig[cardKey];
  const { data, isLoading, error } = useSWR(config?.apiUrl, fetcher);
  const [search, setSearch] = useState("");

  if (!config) return null;

  // Filter data
  const filterData = (items: any[]) => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item: any) => {
      const searchString = JSON.stringify(item).toLowerCase();
      return searchString.includes(q);
    });
  };

  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#E8F5E9] border-t-[#2E7D32] rounded-full animate-spin" />
            <span className="text-gray-500 text-base">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Icon icon="tabler:alert-circle" height={40} className="mx-auto mb-2 text-red-400" />
          <p className="text-lg">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      );
    }

    const items = Array.isArray(data) ? data : [];
    const filtered = filterData(items);

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Icon icon="tabler:database-off" height={40} className="mx-auto mb-2" />
          <p className="text-lg">{search ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูล"}</p>
        </div>
      );
    }

    switch (cardKey) {
      case "users":
        return <UsersTable data={filtered} />;
      case "students":
        return <StudentsTable data={filtered} />;
      case "departments":
        return <DepartmentsTable data={filtered} />;
      case "teachers":
        return <TeachersTable data={filtered} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-md overflow-hidden
                    animate-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.iconBg} rounded-xl flex items-center justify-center shadow`}>
            <Icon icon={config.icon} height={22} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{config.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon icon="tabler:x" height={22} />
        </button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-gray-50">
        <div className="relative max-w-md">
          <Icon icon="tabler:search" height={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา..."
            className="w-full pl-10 pr-4 py-2.5 text-base border-2 border-gray-200 rounded-xl
                       bg-gray-50 placeholder-gray-400
                       focus:outline-none focus:border-[#2E7D32] focus:ring-1 focus:ring-[#2E7D3240] focus:bg-white
                       transition-all duration-200"
          />
        </div>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto">
        {renderTable()}
      </div>
    </div>
  );
};

// ========  Sub-tables  ========

function UsersTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">#</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">ชื่อ - นามสกุล</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">เลขบัตรประชาชน</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">เบอร์โทร</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">บทบาท</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((user: any, i: number) => (
          <tr key={user.id} className="hover:bg-[#F1F8E9] transition-colors">
            <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
            <td className="px-6 py-4">
              <p className="text-base font-medium text-gray-800">{user.firstname} {user.lastname}</p>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{user.citizenId ?? "-"}</td>
            <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{user.phone ?? "-"}</td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
                {userRole(Number(user.role))}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StudentsTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">#</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">รหัสนักศึกษา</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">ชื่อ - นามสกุล</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">แผนก</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">สาขา</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">ห้อง</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((student: any, i: number) => (
          <tr key={student.id} className="hover:bg-[#E3F2FD40] transition-colors">
            <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
            <td className="px-6 py-4">
              <span className="font-mono text-sm text-[#1565C0] font-semibold">{student.studentId}</span>
            </td>
            <td className="px-6 py-4">
              <p className="text-base font-medium text-gray-800">{student.user?.firstname} {student.user?.lastname}</p>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{student.department?.depname ?? "-"}</td>
            <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{student.major?.major_name ?? "-"}</td>
            <td className="px-6 py-4 hidden sm:table-cell">
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-[#E3F2FD] text-[#1565C0]">
                {student.room ?? "-"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DepartmentsTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">#</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">ชื่อแผนก</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">วันที่สร้าง</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((dept: any, i: number) => (
          <tr key={dept.id} className="hover:bg-[#FFF3E040] transition-colors">
            <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                  <Icon icon="tabler:building" height={18} className="text-[#E65100]" />
                </div>
                <p className="text-base font-medium text-gray-800">{dept.depname}</p>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
              {dept.createAt ? new Date(dept.createAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TeachersTable({ data }: { data: any[] }) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">#</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">ชื่อ - นามสกุล</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">แผนก</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">สาขา</th>
          <th className="px-6 py-3 text-sm font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">ระดับการศึกษา</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((teacher: any, i: number) => (
          <tr key={teacher.id} className="hover:bg-[#F3E5F540] transition-colors">
            <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
            <td className="px-6 py-4">
              <p className="text-base font-medium text-gray-800">{teacher.user?.firstname} {teacher.user?.lastname}</p>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{teacher.department?.depname ?? "-"}</td>
            <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{teacher.major?.major_name ?? "-"}</td>
            <td className="px-6 py-4 hidden sm:table-cell">
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-[#F3E5F5] text-[#6A1B9A]">
                {teacher.education?.name ?? "-"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DetailTable;
