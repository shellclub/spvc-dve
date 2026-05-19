"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin section crashed:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-red-100">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold">โอ๊ะโอ! เกิดข้อผิดพลาดในระบบ (Client Error)</h2>
        </div>
        
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 overflow-auto">
          <p className="font-mono text-sm text-red-800 font-semibold mb-2">Error Message:</p>
          <p className="font-mono text-sm text-red-700 bg-red-100/50 p-2 rounded">{error.message || "Unknown error"}</p>
          
          {error.stack && (
            <>
              <p className="font-mono text-sm text-red-800 font-semibold mt-4 mb-2">Stack Trace:</p>
              <pre className="font-mono text-xs text-red-600 bg-red-100/50 p-3 rounded whitespace-pre-wrap overflow-x-auto">
                {error.stack}
              </pre>
            </>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          กรุณาแคปหน้าจอนี้และส่งให้ผู้พัฒนาระบบ เพื่อให้สามารถแก้ไขปัญหาได้อย่างตรงจุดครับ
        </p>

        <button
          onClick={() => reset()}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          ลองโหลดใหม่อีกครั้ง (Try Again)
        </button>
      </div>
    </div>
  );
}
