
"use client"
import React from "react";
import { TopCards } from "../components/dashboards/modern/TopCards";
import { RevenueUpdate } from "../components/dashboards/modern/RevenueUpdate";
import { YearlyBreakup } from "../components/dashboards/modern/YearlyBreakup";
import { MonthlyEarning } from "../components/dashboards/modern/MonthlyEarning";
import { EmployeeSalary } from "../components/dashboards/modern/EmployeeSalary";
import { Customers } from "../components/dashboards/modern/Customers";
import { Projects } from "../components/dashboards/modern/Projects";
import { Social } from "../components/dashboards/modern/Social";
import { SellingProducts } from "../components/dashboards/modern/SellingProducts";
import { WeeklyStats } from "../components/dashboards/modern/WeeklyStats";
import { TopPerformer } from "../components/dashboards/modern/TopPerformer";

const page = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <TopCards/>
        </div>
      </div>
     
    </>
  );
};

export default page;
