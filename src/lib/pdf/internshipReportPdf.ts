import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import '@/fonts/THSarabunNew-normal.js';

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
  };
}

const genderTitle = (sex?: number) =>
  sex === 1 ? "นาย" : sex === 2 ? "นางสาว" : "";

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

/** พิมพ์เล่มฝึกงานฉบับเต็ม: หน้าปก + ตารางรายงานรายสัปดาห์ (ถ่ายภาพจาก DOM) เป็น PDF เดียว แล้วเปิดแท็บใหม่ */
export async function exportInternshipReportBook(
  student: InternshipBookStudent,
  domNodeId: string = "reportContent"
) {
  const input = document.getElementById(domNodeId);
  if (!input) return;

  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();

  buildCoverPage(pdf, student);
  pdf.addPage();

  const headerText = `รายงานการฝึกงาน \n ${student.student?.studentId || ""}  ${genderTitle(student.sex)} ${student.firstname || ""} ${student.lastname || ""} ระดับชั้น ${student.student?.gradeLevel || ""} กลุ่ม ${student.student?.room || ""} สาขาวิชา ${student.student?.major || ""}`;
  pdf.setFont("THSarabunNew");
  pdf.setFontSize(18);
  pdf.text(headerText, pageWidth / 2, 15, { align: "center" });

  const topOffset = 25;
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pageWidth;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, "PNG", 0, topOffset, pdfWidth, pdfHeight);

  const blob = pdf.output("blob");
  const blobURL = URL.createObjectURL(blob);
  window.open(blobURL);
}
