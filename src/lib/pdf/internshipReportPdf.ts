import jsPDF from "jspdf";
import '@/fonts/THSarabunNew-normal.js';
import { formatThaiDate } from "@/lib/utils";

export interface InternshipBookReport {
  id?: number;
  reportDate: string;
  title?: string;
  description?: string;
  image?: string | null;
}

export interface InternshipBookStudent {
  firstname?: string;
  lastname?: string;
  sex?: number;
  department?: {
    depname?: string;
  };
  student?: {
    studentId?: string;
    gradeLevel?: string;
    room?: string;
    term?: string;
    academicYear?: string;
    major?: string;
    /** วันที่เริ่มฝึกงาน (ใช้เป็นจุดยึดคำนวณ "สัปดาห์ที่") */
    startDate?: string;
    report?: InternshipBookReport[];
  };
}

const genderTitle = (sex?: number) =>
  sex === 1 ? "นาย" : sex === 2 ? "นางสาว" : "";

const THAI_WEEKDAY_ABBR = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const thaiWeekdayAbbr = (d: Date) => THAI_WEEKDAY_ABBR[d.getDay()];

const hasImage = (image?: string | null) =>
  !!image && image !== "null" && image !== "undefined";

const reportImageSrc = (image: string) => `/report/${image}`;

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

interface WeekGroup {
  weekNo: number;
  weekStart: Date;
  weekEnd: Date;
  entries: InternshipBookReport[];
}

/** จัดกลุ่มรายงานเป็นรายสัปดาห์ โดยยึดวันเริ่มฝึกงาน (ถ้าไม่มีให้ยึดวันที่รายงานแรกสุด) */
function groupReportsByWeek(
  reports: InternshipBookReport[],
  startDateStr?: string
): WeekGroup[] {
  const sorted = [...reports]
    .filter((r) => r.reportDate)
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());

  if (sorted.length === 0) return [];

  // ยึดวันที่เร็วที่สุดระหว่าง startDate กับรายงานแรก กัน startDate ที่บันทึกผิด/ช้ากว่าความจริง
  // ทำให้รายงานเก่าถูกอัดลงสัปดาห์ที่ 1 จนล้นหน้า
  const earliestReport = startOfDay(new Date(sorted[0].reportDate));
  const anchor = startDateStr
    ? new Date(Math.min(startOfDay(new Date(startDateStr)).getTime(), earliestReport.getTime()))
    : earliestReport;

  const weeksMap = new Map<number, InternshipBookReport[]>();
  sorted.forEach((r) => {
    const diffDays = Math.floor(
      (startOfDay(new Date(r.reportDate)).getTime() - anchor.getTime()) / 86400000
    );
    const weekNo = Math.max(Math.floor(diffDays / 7) + 1, 1);
    if (!weeksMap.has(weekNo)) weeksMap.set(weekNo, []);
    weeksMap.get(weekNo)!.push(r);
  });

  return Array.from(weeksMap.keys())
    .sort((a, b) => a - b)
    .map((weekNo) => {
      const weekStart = new Date(anchor);
      weekStart.setDate(anchor.getDate() + (weekNo - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return { weekNo, weekStart, weekEnd, entries: weeksMap.get(weekNo)! };
    });
}

interface ImgInfo {
  dataUrl: string;
  width: number;
  height: number;
}

/** โหลดรูปจาก URL เดียวกัน (same-origin) แล้วแปลงเป็น dataURL สำหรับฝังใน PDF */
function loadImageDataUrl(url: string): Promise<ImgInfo | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.85),
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** หน้าปกเล่มรายงานฝึกงาน (โลโก้ + ชื่อโรงเรียน + ข้อมูลนักศึกษาจริง) */
export function buildCoverPage(pdf: jsPDF, student: InternshipBookStudent) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFont("THSarabunNew");

  const logoWidth = 50;
  const logoHeight = 50;
  pdf.addImage(
    "/images/logos/logo_pdf.png",
    "PNG",
    (pageWidth - logoWidth) / 2,
    30,
    logoWidth,
    logoHeight
  );

  pdf.setFontSize(40);
  pdf.text("วิทยาลัยอาชีวะศึกษาสุพรรณบุรี", pageWidth / 2, 100, { align: "center" });

  pdf.setFontSize(30);
  pdf.text("รายงานผลการฝึกงาน", pageWidth / 2, 120, { align: "center" });

  pdf.setFontSize(30);
  const term = student.student?.term || "";
  const academicYear = student.student?.academicYear || "";
  pdf.text(`ภาคเรียนที่ ${term} ปีการศึกษา ${academicYear}`, pageWidth / 2, 140, {
    align: "center",
  });

  pdf.setFontSize(30);
  const studentInfo = [
    student.student?.studentId || "",
    `${genderTitle(student.sex)} ${student.firstname || ""} ${student.lastname || ""}`.trim(),
    `ระดับชั้น ${student.student?.gradeLevel || ""} กลุ่ม ${student.student?.room || ""}`,
    `สาขาวิชา ${student.student?.major || ""}`,
  ];
  let yPosition = 170;
  studentInfo.forEach((info) => {
    pdf.text(info, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;
  });

  pdf.setFontSize(40);
  pdf.text("คำนำงานคณะกรรมการการอาชีวศึกษา", pageWidth / 2, 250, { align: "center" });
  pdf.text("กระทรวงศึกษาธิการ", pageWidth / 2, 270, { align: "center" });
}

const ACCENT: [number, number, number] = [46, 125, 50]; // #2E7D32 ให้เข้าธีมเว็บ

/** วาดหน้ารายงาน 1 สัปดาห์ (จบในหน้าเดียว) พร้อมช่องลงชื่อนักศึกษา/ครูนิเทศก์ */
function drawWeekPage(
  pdf: jsPDF,
  student: InternshipBookStudent,
  week: WeekGroup,
  imageCache: Map<string, ImgInfo | null>
) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  pdf.setFont("THSarabunNew", "normal");
  pdf.setTextColor(20, 20, 20);

  // ---------- Header ----------
  let y = 17;
  pdf.setFontSize(17);
  pdf.text("แบบบันทึกการฝึกงานประจำสัปดาห์", pageWidth / 2, y, { align: "center" });

  y += 7;
  pdf.setFontSize(13);
  pdf.setTextColor(...ACCENT);
  pdf.text(
    `สัปดาห์ที่ ${week.weekNo}   (${formatThaiDate(week.weekStart.toISOString())} - ${formatThaiDate(week.weekEnd.toISOString())})`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  pdf.setTextColor(20, 20, 20);

  y += 8;
  pdf.setFontSize(11);
  const name = `${genderTitle(student.sex)}${student.firstname || ""} ${student.lastname || ""}`.trim();
  const infoLine = `ชื่อ-สกุล  ${name}      รหัสนักศึกษา  ${student.student?.studentId || ""}      ระดับชั้น  ${student.student?.gradeLevel || ""}/${student.student?.room || ""}      สาขาวิชา  ${student.student?.major || ""}`;
  pdf.text(infoLine, marginX, y);

  y += 3.5;
  pdf.setDrawColor(190, 190, 190);
  pdf.setLineWidth(0.4);
  pdf.line(marginX, y, pageWidth - marginX, y);
  y += 5;

  // ---------- Layout constants ----------
  const sigAreaHeight = 32;
  const sigAreaTop = pageHeight - 16 - sigAreaHeight;
  const tableBottomLimit = sigAreaTop - 5;
  const headerRowH = 9;
  const tableTop = y;

  const entries = week.entries;
  const n = Math.max(entries.length, 1);
  // ไม่ตั้ง floor สูงเกินไป เพื่อการันตีว่าตารางจะจบในหน้าเดียวเสมอ ไม่ทับช่องลงชื่อ
  const rowH = Math.min(26, Math.max(6, (tableBottomLimit - tableTop - headerRowH) / n));

  const colW = {
    idx: 9,
    date: 26,
    img: 24,
    desc: 0,
  };
  colW.desc = contentWidth - colW.idx - colW.date - colW.img;

  // ---------- Table header ----------
  pdf.setFillColor(...ACCENT);
  pdf.setTextColor(255, 255, 255);
  pdf.rect(marginX, tableTop, contentWidth, headerRowH, "F");
  pdf.setFontSize(11);
  const headers: [string, number][] = [
    ["#", colW.idx],
    ["วันที่", colW.date],
    ["รูปภาพ", colW.img],
    ["รายละเอียดการปฏิบัติงาน", colW.desc],
  ];
  let hx = marginX;
  headers.forEach(([label, w]) => {
    pdf.text(label, hx + w / 2, tableTop + headerRowH / 2 + 2.2, { align: "center" });
    hx += w;
  });
  pdf.setTextColor(20, 20, 20);

  // ---------- Table rows ----------
  let rowY = tableTop + headerRowH;
  pdf.setDrawColor(205, 205, 205);
  pdf.setLineWidth(0.25);

  entries.forEach((r, i) => {
    if (i % 2 === 1) {
      pdf.setFillColor(244, 247, 244);
      pdf.rect(marginX, rowY, contentWidth, rowH, "F");
    }
    pdf.rect(marginX, rowY, contentWidth, rowH);
    let cx = marginX;
    [colW.idx, colW.date, colW.img].forEach((w) => {
      cx += w;
      pdf.line(cx, rowY, cx, rowY + rowH);
    });

    pdf.setFontSize(11);
    pdf.text(String(i + 1), marginX + colW.idx / 2, rowY + rowH / 2 + 1.5, {
      align: "center",
    });

    const d = new Date(r.reportDate);
    const dateX = marginX + colW.idx + colW.date / 2;
    pdf.text(thaiWeekdayAbbr(d), dateX, rowY + rowH / 2 - 1.5, { align: "center" });
    pdf.text(formatThaiDate(r.reportDate), dateX, rowY + rowH / 2 + 3, { align: "center" });

    const imgX = marginX + colW.idx + colW.date;
    const info = hasImage(r.image) ? imageCache.get(r.image as string) : null;
    if (info) {
      const boxSize = Math.min(rowH - 4, colW.img - 4, 20);
      const ratio = info.width / info.height;
      let dw = boxSize;
      let dh = boxSize;
      if (ratio > 1) dh = boxSize / ratio;
      else dw = boxSize * ratio;
      const dx = imgX + (colW.img - dw) / 2;
      const dy = rowY + (rowH - dh) / 2;
      pdf.addImage(info.dataUrl, "JPEG", dx, dy, dw, dh);
    } else {
      pdf.setFontSize(9);
      pdf.setTextColor(160, 160, 160);
      pdf.text("ไม่มีรูป", imgX + colW.img / 2, rowY + rowH / 2 + 1, { align: "center" });
      pdf.setTextColor(20, 20, 20);
    }

    const descX = imgX + colW.img + 3;
    const descW = colW.desc - 6;
    const lineH = 4.3;
    const maxLines = Math.max(1, Math.floor((rowH - 5) / lineH));

    pdf.setFont("THSarabunNew", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(...ACCENT);
    const titleLines: string[] = pdf.splitTextToSize(r.title || "ไม่มีหัวข้อ", descW);
    pdf.text(titleLines[0], descX, rowY + 5);
    pdf.setTextColor(20, 20, 20);

    pdf.setFontSize(10);
    let descLines: string[] = pdf.splitTextToSize(r.description || "-", descW);
    const remainingLines = Math.max(maxLines - 1, 1);
    if (descLines.length > remainingLines) {
      descLines = descLines.slice(0, remainingLines);
      const last = descLines[remainingLines - 1] || "";
      descLines[remainingLines - 1] = last.slice(0, Math.max(last.length - 3, 0)) + "...";
    }
    descLines.forEach((line, li) => {
      pdf.text(line, descX, rowY + 5 + lineH * (li + 1));
    });

    rowY += rowH;
  });

  // ---------- Signatures ----------
  const sigY = sigAreaTop + 9;
  const half = contentWidth / 2;
  pdf.setFontSize(12);

  const drawSignature = (label: string, cx: number) => {
    pdf.text("ลงชื่อ ..................................................", cx, sigY, {
      align: "center",
    });
    pdf.text("(..................................................)", cx, sigY + 7, {
      align: "center",
    });
    pdf.text(label, cx, sigY + 13.5, { align: "center" });
    pdf.text("วันที่ ......... / ......... / .........", cx, sigY + 20.5, {
      align: "center",
    });
  };

  drawSignature("นักศึกษา", marginX + half / 2);
  drawSignature("ครูนิเทศก์ / พี่เลี้ยง", marginX + half + half / 2);

  // ---------- Footer ----------
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `หน้า ${pdf.getNumberOfPages() - 1}`,
    pageWidth - marginX,
    pageHeight - 8,
    { align: "right" }
  );
  pdf.setTextColor(20, 20, 20);
}

/** พิมพ์เล่มฝึกงานฉบับเต็ม: หน้าปก + รายงานแยกเป็นแผ่นตามสัปดาห์ (จบในหน้าเดียวต่อสัปดาห์) เป็น PDF เดียว แล้วเปิดแท็บใหม่ */
export async function exportInternshipReportBook(student: InternshipBookStudent) {
  const reports = student.student?.report ?? [];
  const weeks = groupReportsByWeek(reports, student.student?.startDate);

  const imageCache = new Map<string, ImgInfo | null>();
  await Promise.all(
    reports
      .filter((r) => hasImage(r.image))
      .map(async (r) => {
        const key = r.image as string;
        if (!imageCache.has(key)) {
          imageCache.set(key, await loadImageDataUrl(reportImageSrc(key)));
        }
      })
  );

  const pdf = new jsPDF("p", "mm", "a4");
  buildCoverPage(pdf, student);

  if (weeks.length === 0) {
    pdf.addPage();
    pdf.setFont("THSarabunNew", "normal");
    pdf.setFontSize(20);
    pdf.text(
      "ยังไม่มีการบันทึกรายงานการฝึกงาน",
      pdf.internal.pageSize.getWidth() / 2,
      150,
      { align: "center" }
    );
  } else {
    weeks.forEach((week) => {
      pdf.addPage();
      drawWeekPage(pdf, student, week, imageCache);
    });
  }

  const blob = pdf.output("blob");
  const blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
}
