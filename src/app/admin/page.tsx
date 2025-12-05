
import React from "react";
import { TopCards } from "../components/dashboards/modern/TopCards";

const page = () => {
  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-12">
          <TopCards />
        </div>
      </div>

    </>
  );
};

export default page;
