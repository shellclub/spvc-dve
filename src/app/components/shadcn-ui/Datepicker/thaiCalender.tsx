"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Default-Ui/card";
import { Calendar } from "../Default-Ui/calendar";

export default function ThaiCalendarDemo() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Thai Calendar Demo</h1>
        <p className="text-neutral-600 dark:text-neutral-400">ตัวอย่างการใช้งาน Calendar ที่รองรับภาษาไทย</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Single Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>เลือกวันที่เดียว (Single Date)</CardTitle>
            <CardDescription>คลิกเพื่อเลือกวันที่</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              captionLayout="dropdown"
              className="rounded-md border"
            />
            {selectedDate && (
              <p className="text-sm font-medium">
                วันที่เลือก:{" "}
                {selectedDate.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </CardContent>
        </Card>

     
      </div>

     
    </div>
  )
}
