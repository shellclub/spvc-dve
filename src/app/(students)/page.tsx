
"use client"
import React from "react";

import InternshipReportForm from "./components/profileJob";
import { TopCards } from "./components/TopCards";

const Students = () => {
 
  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          {/* <TopCards/> */}
        </div>
        <div className="col-span-12">
          <InternshipReportForm/> 
        </div>

      </div>
      
     
    </>
  );
};

export default Students;
