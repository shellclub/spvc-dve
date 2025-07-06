"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Label } from "../Default-Ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../Default-Ui/popover"
import { Button } from "../Default-Ui/button"
import { Calendar } from "../Default-Ui/calendar"
import { Card } from "flowbite-react"



export function DatePicker() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        เลือกวันที่
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date" className="w-64 justify-between font-normal bg-transparent">
            {date ? date.toLocaleDateString("th-TH") : "เลือกวันที่"}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0 " align="start">
          <Card>
          <Calendar
          className="z-50"
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date)
              setOpen(false)
            }}
          />

          </Card>
        </PopoverContent>
      </Popover>
      {date && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          วันที่เลือก:{" "}
          {date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  )
}
