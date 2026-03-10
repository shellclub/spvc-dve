"use client";
import React, { useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { formatThaiDate } from "@/lib/utils";
import Image from "next/image";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSession } from "next-auth/react";
import useSWR from "swr";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import '@/fonts/THSarabunNew-normal.js';
dayjs.extend(customParseFormat)

export interface PaginationTableType {
  id?: string;
  title: string;
  description: string;
  reportDate: Date;
  image: string;
}

const columnHelper = createColumnHelper<PaginationTableType>();
const fetcher = (url: string) => fetch(url).then(res => res.json());

const ExportTable = () => {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const swrKey = session?.user?.id ? `/api/report/getBystudent/${session.user.id}` : null;
  const userKey = session?.user?.id ? `/api/students/${session.user.id}` : null;

  const { data, isLoading } = useSWR(swrKey, fetcher);
  const { data: user } = useSWR(userKey, fetcher);

  // ─── PDF Export (เดิม) ───
  const exportToPDF = async () => {
    const input = document.getElementById('reportContent');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFont('THSarabunNew');

    const logoWidth = 50;
    const logoHeight = 50;
    const logoX = (pageWidth - logoWidth) / 2;
    pdf.addImage("/images/logos/logo_pdf.png", 'PNG', logoX, 30, logoWidth, logoHeight);

    pdf.setFontSize(40);
    pdf.text('วิทยาลัยอาชีวะศึกษาสุพรรณบุรี', pageWidth / 2, 100, { align: 'center' });

    pdf.setFontSize(30);
    pdf.text('รายงานผลการฝึกงาน', pageWidth / 2, 120, { align: 'center' });

    pdf.setFontSize(30);
    const currentYear = new Date().getFullYear() + 543;
    pdf.text(`ภาคเรียนที่ 1 ปีการศึกษา ${currentYear}`, pageWidth / 2, 140, { align: 'center' });

    pdf.setFontSize(30);
    const studentInfo = [
      `${user?.student?.studentId || ''}`,
      `${user?.sex === 1 ? "นาย" : user?.sex === 2 ? "นางสาว" : ""} ${user?.firstname || ''} ${user?.lastname || ''}`,
      `ระดับชั้น ${user?.student?.gradeLevel || ''} ปวส.2 (ทท. 2/1 )`,
      `สาขาวิชา ${user?.student?.major.major_name || ""}`
    ];

    let yPosition = 170;
    studentInfo.forEach(info => {
      pdf.text(info, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
    });

    pdf.setFontSize(40);
    pdf.text('คำนำงานคณะกรรมการการอาชีวศึกษา', pageWidth / 2, 250, { align: 'center' });
    pdf.text('กระทรวงศึกษาธิการ', pageWidth / 2, 270, { align: 'center' });

    pdf.addPage();

    const headerText = `รายงานการฝึกงาน \n ${user?.student?.studentId}  ${user?.sex === 1 ? "นาย" : user?.sex === 2 ? "นางสาว" : ""} ${user?.firstname} ${user?.lastname} ระดับชั้น ${user?.student?.gradeLevel} กลุ่ม ${user?.student?.room} สาขาวิชา ${user?.student?.major.major_name}`;
    pdf.setFont('THSarabunNew');
    pdf.setFontSize(18);
    pdf.text(headerText, pageWidth / 2, 15, { align: 'center' });

    const topOffset = 25;
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, topOffset, pdfWidth, pdfHeight);

    const blob = pdf.output('blob');
    const blobURL = URL.createObjectURL(blob);
    window.open(blobURL);
  };

  const columns = [
    columnHelper.display({
      id: "index",
      header: () => <span>#</span>,
      cell: (info) => <div className="text-base text-center">{info.row.index + 1}</div>,
    }),
    columnHelper.accessor("reportDate", {
      cell: (info) => (
        <div className="text-base">{formatThaiDate(String(info.getValue()))}</div>
      ),
      header: () => <span>วัน/เดือน/ปี</span>,
    }),
    columnHelper.accessor("image", {
      cell: (info) => (
        <div className="flex justify-center">
          {info.getValue() ? (
            <Image src={`/report/${info.getValue()}`} width={80} height={80} alt="report" unoptimized className="rounded-lg" />
          ) : (
            <span className="text-gray-300 text-sm">-</span>
          )}
        </div>
      ),
      header: () => <span>รูปภาพ</span>,
    }),
    columnHelper.accessor("title", {
      cell: (info) => <div className="text-base font-medium">{info.getValue()}</div>,
      header: () => <span>ข้อมูลการฝึกงาน</span>,
    }),
    columnHelper.accessor("description", {
      cell: (info) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">{info.getValue()}</div>
      ),
      header: () => <span>รายละเอียด</span>,
    }),
  ];

  const table = useReactTable({
    data: data ?? [],
    columns,
    filterFns: {},
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-100 border-t-[#2E7D32] rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ──── Header ──── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-2xl flex items-center justify-center shadow-lg">
            <Icon icon="tabler:printer" className="text-white" width={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ส่งออกรายงาน</h1>
            <p className="text-sm text-gray-500">ดูรายงานและพิมพ์เป็น PDF</p>
          </div>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm"
        >
          <Icon icon="tabler:file-type-pdf" width={18} />
          ส่งออก PDF
        </button>
      </div>

      {/* ──── Report cards (visual view) ──── */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data
            .slice()
            .sort((a: any, b: any) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
            .map((report: any, idx: number) => (
              <div key={report.id} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                {report.image && (
                  <div className="relative h-40 bg-gray-50">
                    <Image src={`/report/${report.image}`} alt={report.title} fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-[#2E7D32] to-[#4CAF50] px-2.5 py-0.5 rounded-full">
                      วันที่ {idx + 1}
                    </span>
                    <span className="text-xs text-gray-400">
                      {dayjs(report.reportDate).format("DD/MM/YYYY")}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm truncate">{report.title}</h3>
                  {report.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ──── Hidden table for PDF export ──── */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-6" id="reportContent">
          <table className="min-w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-base text-center font-semibold py-3 border border-gray-300 px-3 bg-gray-50">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border border-gray-200 py-3 px-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            ทั้งหมด {table.getPrePaginationRowModel().rows.length} รายการ
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-colors">
              <Icon icon="tabler:chevron-left" width={18} className="text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-colors">
              <Icon icon="tabler:chevron-right" width={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportTable;
